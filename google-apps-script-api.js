const DATA_SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const BACKUP_FOLDER_ID = 'YOUR_BACKUP_FOLDER_ID_HERE'; // Tùy chọn
const API_SECRET_KEY = 'YOUR_KEY'; 

function doGet(e) {
  return handleRequest(e);
}
function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = e.parameter;
  let input = {};

  try {
    if (e.postData && e.postData.contents) {
      input = JSON.parse(e.postData.contents);
    }
  } catch (err) {}

  const action = params.action || input.action || '';

  try {
    switch (action) {
      case 'ping': return ok({ status: 'ok', message: 'Google Apps Script Cookie API v2' });
      case 'save': return saveSnapshot(params, input);
      case 'delete': return deleteSnapshot(params, input);
      case 'delete_web': return deleteWeb(params, input);
      case 'get': return getAllData(params, input);           // ← Đã sửa theo PHP
      case 'get_one': return getSnapshot(params, input);      // Giữ lại để lấy 1 snapshot
      case 'list': return listSheets(params, input);
      case 'stats': return getStats();
      case 'backup_upload': return backupUpload(params, input);
      case 'backup_list': return backupList();
      case 'backup_download': return backupDownload(params, input);
      case 'backup_delete': return backupDelete(params, input);
      default:
        return fail('Action không hợp lệ: ' + action);
    }
  } catch (error) {
    console.error(error);
    return fail('Lỗi server: ' + error.message, 500);
  }
}

// ==================== HELPERS ====================
function getSpreadsheet() {
  return SpreadsheetApp.openById(DATA_SPREADSHEET_ID);
}

function getBackupFolder() {
  if (BACKUP_FOLDER_ID) {
    return DriveApp.getFolderById(BACKUP_FOLDER_ID);
  }
  const folders = DriveApp.getFoldersByName('Cookie Backups');
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder('Cookie Backups');
}

function sanitizeWeb(web) {
  return web.toString().trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
}

function validateKey(params, input) {
  const key = params.key || input.key || '';
  if (key !== API_SECRET_KEY) {
    throw new Error('Xác thực thất bại: key không hợp lệ');
  }
}

// ==================== RESPONSES ====================
function ok(data = {}) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, ...data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function fail(error, code = 200) {
  const output = ContentService.createTextOutput(JSON.stringify({ success: false, error }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ==================== ACTIONS ====================

// SAVE
function saveSnapshot(params, input) {
  const web = sanitizeWeb(params.web || input.web || '');
  const name = (params.name || input.name || '').trim();
  const cookie = input.cookie || params.cookie || '';
  const time = input.time || params.time || new Date().toISOString();
  const timerISO = input.timerISO || params.timerISO || '';

  if (!web || !name) return fail('Thiếu web hoặc name');

  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(web);
  if (!sheet) {
    sheet = ss.insertSheet(web);
    sheet.appendRow(['name', 'time', 'timerISO', 'cookie', 'savedAt']);
  }

  const data = sheet.getDataRange().getValues();
  let found = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === name) {
      sheet.getRange(i + 1, 2).setValue(time);
      sheet.getRange(i + 1, 3).setValue(timerISO);
      if (cookie) sheet.getRange(i + 1, 4).setValue(cookie);
      sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([name, time, timerISO, cookie, new Date().toISOString()]);
  }

  return ok({ message: found ? 'Đã cập nhật' : 'Đã tạo mới', created: !found });
}

// DELETE ONE
function deleteSnapshot(params, input) {
  const web = sanitizeWeb(params.web || input.web || '');
  const name = (params.name || input.name || '').trim();
  if (!web || !name) return fail('Thiếu web hoặc name');

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(web);
  if (!sheet) return fail('Không tìm thấy web');

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === name) {
      sheet.deleteRow(i + 1);
      return ok({ message: 'Đã xoá snapshot' });
    }
  }
  return fail('Không tìm thấy snapshot');
}

// DELETE WEB
function deleteWeb(params, input) {
  const web = sanitizeWeb(params.web || input.web || '');
  if (!web) return fail('Thiếu web');

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(web);
  if (sheet) ss.deleteSheet(sheet);
  return ok({ message: 'Đã xoá toàn bộ dữ liệu của ' + web });
}

// LIST
function listSheets(params, input) {
  const web = sanitizeWeb(params.web || input.web || '');
  const ss = getSpreadsheet();

  if (web) {
    const sheet = ss.getSheetByName(web);
    if (!sheet) return ok({ sheets: [], count: 0 });

    const data = sheet.getDataRange().getValues();
    const result = data.slice(1).map(row => ({
      name: row[0],
      time: row[1],
      savedAt: row[4]
    }));
    return ok({ sheets: result, count: result.length });
  }

  // List tất cả web
  const sheets = ss.getSheets();
  const result = [];
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name === 'Sheet1' || name.startsWith('_')) return;
    const count = Math.max(0, sheet.getLastRow() - 1);
    if (count > 0) {
      result.push({
        web: name.replace(/_/g, '.'),
        count: count,
        lastUpdated: sheet.getRange(sheet.getLastRow(), 5).getValue()
      });
    }
  });
  return ok({ sheets: result });
}

// GET ONE SNAPSHOT (giữ nguyên để tương thích)
function getSnapshot(params, input) {
  const web = sanitizeWeb(params.web || input.web || '');
  const name = (params.name || input.name || '').trim();
  if (!web) return fail('Thiếu web');

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(web);
  if (!sheet) return fail('Không có dữ liệu cho web này');

  const data = sheet.getDataRange().getValues();
  let snap = name 
    ? data.find(row => row[0] === name) 
    : data[data.length - 1];

  if (!snap) return fail('Không tìm thấy snapshot');

  return ok({
    name: snap[0],
    savedAt: snap[4],
    time: snap[1],
    timerISO: snap[2],
    cookies: snap[3],
    count: 1
  });
}

// GET ALL DATA (mới - giống PHP)
function getAllData(params, input) {
  validateKey(params, input);   // Yêu cầu key bảo mật

  const ss = getSpreadsheet();
  const sheets = ss.getSheets();
  const result = [];

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName === 'Sheet1' || sheetName.startsWith('_')) return;

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    const snapshots = data.slice(1).map(row => ({
      name: row[0] || '',
      time: row[1] || '',
      timerISO: row[2] || '',
      cookies: row[3] || '',
      savedAt: row[4] || ''
    }));

    result.push({
      web: sheetName.replace(/_/g, '.'),
      count: snapshots.length,
      snapshots: snapshots
    });
  });

  return ok({
    total_webs: result.length,
    total_snapshots: result.reduce((sum, r) => sum + r.count, 0),
    data: result
  });
}

// STATS
function getStats() {
  const ss = getSpreadsheet();
  const sheets = ss.getSheets();
  let totalWebs = 0;
  let totalSnaps = 0;

  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name === 'Sheet1' || name.startsWith('_')) return;
    const count = Math.max(0, sheet.getLastRow() - 1);
    if (count > 0) {
      totalWebs++;
      totalSnaps += count;
    }
  });

  return ok({
    webs: totalWebs,
    snapshots: totalSnaps,
    size_kb: 'N/A (Sheets)'
  });
}

// ==================== BACKUP ====================
function backupUpload(params, input) {
  const data = input.data || '';
  let filename = (input.filename || '').trim();

  if (!data) return fail('Thiếu data');

  if (!filename) {
    filename = `cookie-backup-${Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd_HHmmss")}.bak`;
  } else if (!filename.toLowerCase().endsWith('.bak')) {
    filename += '.bak';
  }

  const folder = getBackupFolder();
  let file = folder.createFile(filename, data, MimeType.PLAIN_TEXT);

  return ok({
    message: 'Đã lưu backup',
    filename: filename,
    size_kb: Math.round(file.getSize() / 1024, 2)
  });
}

function backupList() {
  const folder = getBackupFolder();
  const files = folder.getFilesByType(MimeType.PLAIN_TEXT);
  const result = [];

  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().toLowerCase().endsWith('.bak')) {
      result.push({
        filename: file.getName(),
        size_kb: Math.round(file.getSize() / 1024, 2),
        created_at: file.getDateCreated().toISOString()
      });
    }
  }

  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return ok({ backups: result, count: result.length });
}

function backupDownload(params, input) {
  const filename = (params.filename || input.filename || '').trim();
  if (!filename || !filename.toLowerCase().endsWith('.bak')) 
    return fail('Thiếu filename hoặc sai định dạng .bak');

  const folder = getBackupFolder();
  const files = folder.getFilesByName(filename);
  if (!files.hasNext()) return fail('Không tìm thấy file: ' + filename);

  const file = files.next();
  return ok({
    filename: file.getName(),
    data: file.getBlob().getDataAsString(),
    size_kb: Math.round(file.getSize() / 1024, 2)
  });
}

function backupDelete(params, input) {
  const filename = (params.filename || input.filename || '').trim();
  if (!filename || !filename.toLowerCase().endsWith('.bak')) 
    return fail('Thiếu filename hoặc sai định dạng .bak');

  const folder = getBackupFolder();
  const files = folder.getFilesByName(filename);
  if (files.hasNext()) {
    files.next().setTrashed(true);
    return ok({ message: 'Đã xoá ' + filename });
  }
  return fail('Không tìm thấy file');
}
