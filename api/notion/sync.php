<?php
/**
 * Notion API 同期スクリプト
 * 
 * Notionのデータベースから記事を取得し、notes.jsonに書き込む
 */

// エラー表示を有効化（デバッグ用）
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

// エラーハンドリング
function sendError($message, $code = 500) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// 設定チェック
if (empty(NOTION_API_KEY)) {
    sendError('NOTION_API_KEY が設定されていません。config.php を確認してください。', 400);
}

if (empty(NOTION_DATABASE_ID)) {
    sendError('NOTION_DATABASE_ID が設定されていません。config.php を確認してください。', 400);
}

// Notion APIリクエスト
function notionRequest($endpoint, $method = 'GET', $data = null) {
    $url = 'https://api.notion.com/v1' . $endpoint;
    
    $headers = [
        'Authorization: Bearer ' . NOTION_API_KEY,
        'Notion-Version: 2022-06-28',
        'Content-Type: application/json'
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        $error = json_decode($response, true);
        sendError('Notion API エラー: ' . ($error['message'] ?? 'Unknown error'), $httpCode);
    }
    
    return json_decode($response, true);
}

// Notionのリッチテキストを平文に変換
function richTextToPlain($richText) {
    if (empty($richText)) return '';
    $text = '';
    foreach ($richText as $item) {
        $text .= $item['plain_text'] ?? '';
    }
    return $text;
}

// Notionのリッチテキストを装飾を保持してHTMLに変換
function richTextToHtml($richText) {
    if (empty($richText)) return '';
    $html = '';
    foreach ($richText as $item) {
        $text = $item['plain_text'] ?? '';
        $annotations = $item['annotations'] ?? [];
        
        // 装飾を適用
        if ($annotations['bold'] ?? false) {
            $text = "<strong>$text</strong>";
        }
        if ($annotations['italic'] ?? false) {
            $text = "<em>$text</em>";
        }
        if ($annotations['strikethrough'] ?? false) {
            $text = "<del>$text</del>";
        }
        if ($annotations['underline'] ?? false) {
            $text = "<u>$text</u>";
        }
        if ($annotations['code'] ?? false) {
            $text = "<code>$text</code>";
        }
        
        // リンクを適用
        if (isset($item['href'])) {
            $text = '<a href="' . htmlspecialchars($item['href']) . '">' . $text . '</a>';
        }
        
        $html .= $text;
    }
    return $html;
}

// NotionのブロックをHTMLに変換
function blockToHtml($block) {
    $type = $block['type'];
    $content = $block[$type] ?? [];
    
    switch ($type) {
        case 'paragraph':
            $text = richTextToHtml($content['rich_text'] ?? []);
            return $text ? "<p>$text</p>" : '';
            
        case 'heading_1':
            $text = richTextToHtml($content['rich_text'] ?? []);
            return "<h1>$text</h1>";
            
        case 'heading_2':
            $text = richTextToHtml($content['rich_text'] ?? []);
            $plainText = richTextToPlain($content['rich_text'] ?? []);
            // 日本語を含むIDを生成（URLエンコードではなく、わかりやすいIDに）
            $id = 'section-' . md5($plainText);
            return "<h2 id=\"$id\">$text</h2>";
            
        case 'heading_3':
            $text = richTextToHtml($content['rich_text'] ?? []);
            return "<h3>$text</h3>";
            
        case 'bulleted_list_item':
            $text = richTextToHtml($content['rich_text'] ?? []);
            return "<li>$text</li>";
            
        case 'numbered_list_item':
            $text = richTextToHtml($content['rich_text'] ?? []);
            return "<li>$text</li>";
            
        case 'quote':
            $text = richTextToHtml($content['rich_text'] ?? []);
            return "<blockquote><p>$text</p></blockquote>";
            
        case 'code':
            $text = richTextToPlain($content['rich_text'] ?? []);
            $language = $content['language'] ?? 'text';
            return "<pre><code class=\"language-$language\">$text</code></pre>";
            
        case 'divider':
            return "<hr>";
            
        case 'table_of_contents':
            // Notionの目次ブロック - プレースホルダーとして扱う
            return '<!-- TOC_PLACEHOLDER -->';
            
        default:
            return '';
    }
}

// ページのブロックを取得してHTMLに変換（ページネーション対応）
function getPageContent($pageId) {
    $allBlocks = [];
    $hasMore = true;
    $startCursor = null;
    
    // ページネーション処理
    while ($hasMore) {
        $endpoint = "/blocks/$pageId/children";
        if ($startCursor) {
            $endpoint .= "?start_cursor=" . urlencode($startCursor);
        }
        
        $response = notionRequest($endpoint);
        $blocks = $response['results'] ?? [];
        $allBlocks = array_merge($allBlocks, $blocks);
        
        $hasMore = $response['has_more'] ?? false;
        $startCursor = $response['next_cursor'] ?? null;
    }
    
    $html = '';
    $inList = false;
    $listType = '';
    
    foreach ($allBlocks as $block) {
        $type = $block['type'];
        
        // リスト処理
        if ($type === 'bulleted_list_item' || $type === 'numbered_list_item') {
            $currentListType = $type === 'bulleted_list_item' ? 'ul' : 'ol';
            
            if (!$inList) {
                $html .= "<$currentListType>";
                $inList = true;
                $listType = $currentListType;
            } elseif ($listType !== $currentListType) {
                $html .= "</$listType><$currentListType>";
                $listType = $currentListType;
            }
            
            $html .= blockToHtml($block);
        } else {
            if ($inList) {
                $html .= "</$listType>";
                $inList = false;
            }
            $html .= blockToHtml($block);
        }
    }
    
    if ($inList) {
        $html .= "</$listType>";
    }
    
    // 目次プレースホルダーを実際の目次に置き換え
    if (strpos($html, '<!-- TOC_PLACEHOLDER -->') !== false) {
        $toc = generateTableOfContents($allBlocks);
        $html = str_replace('<!-- TOC_PLACEHOLDER -->', $toc, $html);
    }
    
    return $html;
}

// 見出しから目次を自動生成
function generateTableOfContents($blocks) {
    $headings = [];
    
    foreach ($blocks as $block) {
        $type = $block['type'];
        if ($type === 'heading_2' || $type === 'heading_3') {
            $content = $block[$type] ?? [];
            $text = richTextToPlain($content['rich_text'] ?? []);
            // 日本語を含むIDを生成（一意性を保証）
            $id = 'section-' . md5($text);
            $headings[] = [
                'level' => $type === 'heading_2' ? 2 : 3,
                'text' => $text,
                'id' => $id
            ];
        }
    }
    
    if (empty($headings)) {
        return '';
    }
    
    $toc = '<div class="article-toc"><h3>目次</h3><ul>';
    foreach ($headings as $heading) {
        if ($heading['level'] === 2) {
            $toc .= '<li><a href="#' . $heading['id'] . '">' . htmlspecialchars($heading['text']) . '</a></li>';
        }
    }
    $toc .= '</ul></div>';
    
    return $toc;
}

// Notionのプロパティから値を取得
function getPropertyValue($property) {
    if (!isset($property['type'])) return '';
    $type = $property['type'];
    
    switch ($type) {
        case 'title':
            return richTextToPlain($property['title'] ?? []);
        case 'rich_text':
            return richTextToPlain($property['rich_text'] ?? []);
        case 'date':
            return $property['date']['start'] ?? '';
        case 'select':
            return $property['select']['name'] ?? '';
        case 'multi_select':
            return array_map(fn($item) => $item['name'], $property['multi_select'] ?? []);
        case 'checkbox':
            return $property['checkbox'] ?? false;
        case 'url':
            return $property['url'] ?? '';
        default:
            return '';
    }
}

// Notionからデータを取得
try {
    // データベースをクエリ（公開済みのみ）
    $query = [
        'filter' => [
            'property' => '公開',
            'checkbox' => [
                'equals' => true
            ]
        ],
        'sorts' => [
            [
                'property' => '日付',
                'direction' => 'descending'
            ]
        ]
    ];
    
    $response = notionRequest('/databases/' . NOTION_DATABASE_ID . '/query', 'POST', $query);
    $pages = $response['results'] ?? [];
    
    // 既存のnotes.jsonを読み込み（手動記事を保持）
    $existingData = ['items' => []];
    if (file_exists(NOTES_JSON_PATH)) {
        $existingJson = file_get_contents(NOTES_JSON_PATH);
        $existingData = json_decode($existingJson, true) ?? ['items' => []];
    }
    
    // 手動記事を保持（IDが "notion-" で始まらないもの）
    $manualArticles = array_filter($existingData['items'] ?? [], function($item) {
        return !str_starts_with($item['id'] ?? '', 'notion-');
    });
    
    // Notionの記事を変換
    $notionArticles = [];
    foreach ($pages as $page) {
        $properties = $page['properties'];
        
        // IDを生成（Notion Page IDから - ハイフンを除いた完全なID）
        $notionId = 'notion-' . str_replace('-', '', $page['id']);
        
        // プロパティを取得
        $title = getPropertyValue($properties['タイトル'] ?? $properties['Title'] ?? []);
        $date = getPropertyValue($properties['日付'] ?? $properties['Date'] ?? []);
        $category = getPropertyValue($properties['カテゴリ'] ?? $properties['Category'] ?? []);
        $tags = getPropertyValue($properties['タグ'] ?? $properties['Tags'] ?? []);
        $coverUrl = getPropertyValue($properties['カバー画像'] ?? $properties['Cover'] ?? []);
        $author = getPropertyValue($properties['著者'] ?? $properties['Author'] ?? []);
        
        // デフォルト値
        if (empty($date)) $date = date('Y-m-d');
        if (empty($category)) $category = '未分類';
        if (empty($author)) $author = AUTHOR_DEFAULT;
        if (empty($coverUrl)) $coverUrl = 'assets/images/S__23273487.jpg';
        if (!is_array($tags)) $tags = [];
        
        // ページの本文を取得
        $body = getPageContent($page['id']);
        
        $notionArticles[] = [
            'id' => $notionId,
            'title' => $title,
            'date' => $date,
            'category' => $category,
            'coverImageUrl' => $coverUrl,
            'author' => $author,
            'tags' => $tags,
            'body' => $body
        ];
    }
    
    // 手動記事とNotion記事をマージ
    $allArticles = array_merge($manualArticles, $notionArticles);
    
    // 日付でソート
    usort($allArticles, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });
    
    // notes.jsonに書き込み
    $newData = ['items' => $allArticles];
    $json = json_encode($newData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
    if (file_put_contents(NOTES_JSON_PATH, $json) === false) {
        sendError('notes.json の書き込みに失敗しました。', 500);
    }
    
    // 成功レスポンス
    echo json_encode([
        'success' => true,
        'message' => '同期が完了しました',
        'stats' => [
            'notion_articles' => count($notionArticles),
            'manual_articles' => count($manualArticles),
            'total_articles' => count($allArticles)
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    sendError('エラーが発生しました: ' . $e->getMessage(), 500);
}
