<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir   = 'cookies_data/';
$backupDir = 'backup/';
if (!is_dir($dataDir))   mkdir($dataDir,   0755, true);
if (!is_dir($backupDir)) mkdir($backupDir, 0755, true);

// Đọc JSON body
$input = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $input = json_decode($json, true) ?? [];
}

$action = $_REQUEST['action'] ?? $input['action'] ?? '';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFilePath($web) {
    global $dataDir;
    $safeWeb = preg_replace('/[^a-zA-Z0-9._-]/', '_', strtolower(trim($web)));
    return $dataDir . $safeWeb . '.json';
}

function readData($web) {
    $file = getFilePath($web);
    if (!file_exists($file)) return [];
    $content = file_get_contents($file);
    return json_decode($content, true) ?? [];
}

function saveData($web, $data) {
    $file = getFilePath($web);
    file_put_contents($file, json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function ok($data = []) {
    echo json_encode(array_merge(['success' => true], $data));
    exit;
}

function fail($error, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $error]);
    exit;
}

// ── PING ──────────────────────────────────────────────────────────────────────
if ($action === 'ping') {
    ok(['status' => 'ok', 'message' => 'PHP Cookie API v2', 'backup_dir' => $backupDir]);
}

// ── SAVE (tạo mới hoặc cập nhật theo name) ────────────────────────────────────
// POST { action, web, name, cookie, timerISO?, time? }
if ($action === 'save') {
    $web    = trim($input['web']    ?? $_REQUEST['web']    ?? '');
    $name   = trim($input['name']   ?? $_REQUEST['name']   ?? '');
    $cookie = $input['cookie']      ?? $_REQUEST['cookie'] ?? '';
    $time   = $input['time']        ?? $_REQUEST['time']   ?? date('c');
    $timer  = $input['timerISO']    ?? $_REQUEST['timerISO'] ?? '';

    if ($web === '' || $name === '') fail('Thiếu web hoặc name');

    $snapshots = readData($web);
    $found = false;

    foreach ($snapshots as &$snap) {
        if ($snap['name'] === $name) {
            if ($cookie !== '') $snap['cookie']   = $cookie;
            if ($timer  !== '') $snap['timerISO'] = $timer;
            $snap['time']    = $time;
            $snap['savedAt'] = date('c');
            $found = true;
            break;
        }
    }
    unset($snap);

    if (!$found) {
        $snapshots[] = [
            'name'     => $name,
            'time'     => $time,
            'timerISO' => $timer,
            'cookie'   => $cookie,
            'savedAt'  => date('c')
        ];
    }

    saveData($web, $snapshots);
    ok(['message' => $found ? 'Đã cập nhật' : 'Đã tạo mới', 'created' => !$found]);
}

// ── DELETE (xoá một snapshot theo web + name) ─────────────────────────────────
// POST/GET { action, web, name }
if ($action === 'delete') {
    $web  = trim($input['web']  ?? $_REQUEST['web']  ?? '');
    $name = trim($input['name'] ?? $_REQUEST['name'] ?? '');

    if ($web === '' || $name === '') fail('Thiếu web hoặc name');

    $snapshots = readData($web);
    $new = array_values(array_filter($snapshots, fn($s) => $s['name'] !== $name));

    if (count($new) === count($snapshots)) fail('Không tìm thấy snapshot');

    if (empty($new)) {
        $file = getFilePath($web);
        if (file_exists($file)) unlink($file);
        ok(['message' => 'Đã xoá snapshot và file']);
    } else {
        saveData($web, $new);
        ok(['message' => 'Đã xoá snapshot']);
    }
}

// ── DELETE_WEB (xoá toàn bộ file của một web) ────────────────────────────────
// POST/GET { action, web }
if ($action === 'delete_web') {
    $web = trim($input['web'] ?? $_REQUEST['web'] ?? '');
    if ($web === '') fail('Thiếu web');

    $file = getFilePath($web);
    if (!file_exists($file)) fail('Không tìm thấy dữ liệu cho web này');

    unlink($file);
    ok(['message' => 'Đã xoá toàn bộ dữ liệu của ' . $web]);
}

// ── LIST (danh sách các web, hoặc danh sách snapshot của một web) ─────────────
// GET ?action=list                   → tất cả web (tổng quát)
// GET ?action=list&web=__BACKUP__    → chỉ các snapshot của web đó
if ($action === 'list') {
    $web = trim($_REQUEST['web'] ?? $input['web'] ?? '');

    if ($web !== '') {
        // ── Liệt kê tất cả snapshot của web cụ thể ──
        $snapshots = readData($web);
        $result = [];
        foreach ($snapshots as $snap) {
            $result[] = [
                'name'    => $snap['name']    ?? '',
                'time'    => $snap['time']    ?? $snap['savedAt'] ?? '',
                'savedAt' => $snap['savedAt'] ?? '',
            ];
        }
        ok(['sheets' => $result, 'count' => count($result)]);
    }

    // ── Liệt kê tất cả web (không lọc) ──
    $files  = glob($dataDir . '*.json') ?: [];
    $result = [];
    foreach ($files as $file) {
        $safeWeb = basename($file, '.json');
        $data    = readData($safeWeb);
        $count   = count($data);
        if ($count > 0) {
            // Khôi phục tên web từ tên file (dấu _ → dấu .)
            // Nhưng giữ nguyên nếu có __ (ví dụ __backup__)
            $webDisplay = str_replace('_', '.', $safeWeb);
            $result[] = [
                'web'         => $webDisplay,
                'count'       => $count,
                'lastUpdated' => end($data)['savedAt'] ?? ''
            ];
        }
    }
    ok(['sheets' => $result]);
}

// ── GET (lấy một snapshot theo web + name; nếu không có name → lấy mục mới nhất) ──
// GET ?action=get&web=facebook.com&name=MyAccount
if ($action === 'get') {
    $web  = trim($_GET['web']  ?? $_REQUEST['web']  ?? $input['web']  ?? '');
    $name = trim($_GET['name'] ?? $_REQUEST['name'] ?? $input['name'] ?? '');

    if ($web === '') fail('Thiếu web');

    $data = readData($web);
    if (empty($data)) fail('Không có dữ liệu cho web này');

    if ($name !== '') {
        // Tìm chính xác theo name
        $snap = null;
        foreach ($data as $s) {
            if ($s['name'] === $name) { $snap = $s; break; }
        }
        if ($snap === null) fail("Không tìm thấy snapshot \"$name\"");
    } else {
        // Không truyền name → trả về mục mới nhất
        $snap = end($data);
    }

    ok([
        'name'     => $snap['name']     ?? '',
        'savedAt'  => $snap['savedAt']  ?? '',
        'time'     => $snap['time']     ?? '',
        'timerISO' => $snap['timerISO'] ?? '',
        'cookies'  => $snap['cookie']   ?? '',
        'count'    => 1
    ]);
}

// ── GET_ALL (lấy toàn bộ snapshot của một web) ────────────────────────────────
// GET ?action=get_all&web=facebook.com
if ($action === 'get_all') {
    $web = trim($_GET['web'] ?? $_REQUEST['web'] ?? $input['web'] ?? '');
    if ($web === '') fail('Thiếu web');

    $data = readData($web);
    if (empty($data)) ok(['snapshots' => [], 'count' => 0]);

    $result = [];
    foreach ($data as $snap) {
        $result[] = [
            'name'     => $snap['name']     ?? '',
            'savedAt'  => $snap['savedAt']  ?? '',
            'time'     => $snap['time']     ?? '',
            'timerISO' => $snap['timerISO'] ?? '',
            'cookies'  => $snap['cookie']   ?? '',
        ];
    }
    ok(['snapshots' => $result, 'count' => count($result)]);
}

// ── STATS (tổng số web, tổng số snapshot, dung lượng) ────────────────────────
// GET ?action=stats
if ($action === 'stats') {
    $files     = glob($dataDir . '*.json') ?: [];
    $totalWebs = 0;
    $totalSnaps = 0;
    $totalBytes = 0;
    foreach ($files as $file) {
        $safeWeb = basename($file, '.json');
        $data    = readData($safeWeb);
        if (!empty($data)) {
            $totalWebs++;
            $totalSnaps += count($data);
            $totalBytes += filesize($file);
        }
    }
    ok([
        'webs'       => $totalWebs,
        'snapshots'  => $totalSnaps,
        'size_bytes' => $totalBytes,
        'size_kb'    => round($totalBytes / 1024, 2)
    ]);
}

// ── BACKUP_UPLOAD (nhận nội dung .bak từ extension, lưu vào thư mục backup/) ──
// POST { action, filename?, data }
// data = nội dung file .bak (string JSON đã mã hoá hoặc plain)
if ($action === 'backup_upload') {
    $data     = $input['data']     ?? '';
    $filename = trim($input['filename'] ?? '');

    if ($data === '') fail('Thiếu data');

    // Tạo tên file an toàn
    if ($filename === '') {
        $filename = 'cookie-backup-' . date('Y-m-d_His') . '.bak';
    } else {
        // Chỉ giữ ký tự an toàn, bắt buộc đuôi .bak
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
        if (!str_ends_with(strtolower($filename), '.bak')) $filename .= '.bak';
    }

    $path = $backupDir . $filename;

    // Không cho ghi đè — nếu trùng tên thì thêm timestamp
    if (file_exists($path)) {
        $base  = basename($filename, '.bak');
        $path  = $backupDir . $base . '_' . date('His') . '.bak';
        $filename = basename($path);
    }

    $written = file_put_contents($path, $data);
    if ($written === false) fail('Không ghi được file — kiểm tra quyền thư mục backup/');

    ok([
        'message'  => 'Đã lưu backup',
        'filename' => $filename,
        'size_kb'  => round($written / 1024, 2)
    ]);
}

// ── BACKUP_LIST (liệt kê các file .bak trong thư mục backup/) ─────────────────
// GET ?action=backup_list
if ($action === 'backup_list') {
    $files  = glob($backupDir . '*.bak') ?: [];
    // Sắp xếp mới nhất lên đầu
    usort($files, fn($a, $b) => filemtime($b) - filemtime($a));

    $result = [];
    foreach ($files as $file) {
        $result[] = [
            'filename'   => basename($file),
            'size_kb'    => round(filesize($file) / 1024, 2),
            'created_at' => date('c', filemtime($file))
        ];
    }
    ok(['backups' => $result, 'count' => count($result)]);
}

// ── BACKUP_DOWNLOAD (trả về nội dung file .bak để extension import) ───────────
// GET ?action=backup_download&filename=cookie-backup-2025-06-13.bak
if ($action === 'backup_download') {
    $filename = trim($_GET['filename'] ?? $_REQUEST['filename'] ?? $input['filename'] ?? '');
    if ($filename === '') fail('Thiếu filename');

    // Chặn path traversal
    $filename = basename($filename);
    if (!str_ends_with(strtolower($filename), '.bak')) fail('Chỉ hỗ trợ file .bak');

    $path = $backupDir . $filename;
    if (!file_exists($path)) fail('Không tìm thấy file: ' . $filename);

    ok([
        'filename' => $filename,
        'data'     => file_get_contents($path),
        'size_kb'  => round(filesize($path) / 1024, 2)
    ]);
}

// ── BACKUP_DELETE (xoá một file .bak) ────────────────────────────────────────
// POST/GET { action, filename }
if ($action === 'backup_delete') {
    $filename = trim($input['filename'] ?? $_REQUEST['filename'] ?? '');
    if ($filename === '') fail('Thiếu filename');

    $filename = basename($filename); // chặn path traversal
    if (!str_ends_with(strtolower($filename), '.bak')) fail('Chỉ hỗ trợ file .bak');

    $path = $backupDir . $filename;
    if (!file_exists($path)) fail('Không tìm thấy file: ' . $filename);

    unlink($path);
    ok(['message' => 'Đã xoá ' . $filename]);
}

// ── Fallback ──────────────────────────────────────────────────────────────────
fail('Action không hợp lệ: ' . htmlspecialchars($action));