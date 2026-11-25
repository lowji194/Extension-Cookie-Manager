'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
let activeTab = null;
let liveCookies = [];
let filteredLive = [];
let onlyCurrentSite = false;
let currentLang = 'en'; // Ngôn ngữ mặc định là tiếng Anh

// ── Bilingual Dictionary (EN / VI) ────────────────────────────────────────────
const I18N = {
  en: {
    pageTitle: 'Cookie Manager',
    loadingTab: 'Detecting current tab...',
    systemSite: host => `System page (${host || 'unsupported'})`,
    unknownTab: 'Unable to detect current page',
    liveBadge: 'Live',
    tabSaved: 'Saved',
    tabLive: 'Current',
    tabBackup: 'Backup',

    snapNamePlaceholder: 'Session name (leave blank to overwrite)...',
    snapNameRequiredPlaceholder: 'Please enter a snapshot name...',
    snapNameNewPlaceholder: 'Enter new snapshot name...',
    btnSave: 'Save',
    btnImportJson: 'Import JSON',
    btnLogout: 'Sign out',
    btnLogoutTitle: 'Expire all cookies on this site to sign out',
    onlyCurrentSite: 'This site',
    onlyCurrentSiteTitle: 'Show only snapshots for the active website',
    btnReloadTitle: 'Refresh list',
    dropJsonHtml: 'Drop a <strong>.json</strong> file here or click to browse',
    loadingList: 'Loading snapshots...',
    emptySavedAll: 'No saved cookie snapshots yet.<br>Enter a name and click <strong>Save</strong> or <strong>Import JSON</strong>.',
    emptySavedSite: 'No snapshots saved for the current website.',
    showAllSites: 'Show all websites',
    currentSitePill: '● Current site',
    tagActive: 'Active',
    tagLegacy: 'Legacy sync',
    tagImport: 'Import',
    cookiesCount: n => `${n} ${n === 1 ? 'cookie' : 'cookies'}`,
    btnRestore: 'Restore',
    btnCopy: 'Copy',
    btnCopied: 'Copied',
    btnCopyTitle: 'Copy Cookie header string',
    btnExportJsonTitle: 'Export JSON file',
    btnDeleteSnapTitle: 'Delete this snapshot',

    overwriteTitle: 'Overwrite snapshot',
    overwriteSub: n => `Choose a snapshot to overwrite (${n} current cookies)`,
    overwriteNewBtn: '+ Enter name for a new snapshot',
    closeLabel: 'Close',

    errLoadDataTitle: 'Failed to load data',
    errLoadDataDesc: 'Unable to read saved snapshots.',
    errCannotSaveTitle: 'Cannot save',
    errHttpOnlySaveDesc: 'Cookies can only be saved on HTTP/HTTPS pages.',
    errNoCookiesTitle: 'No cookies found',
    errNoCookiesSiteDesc: 'This page currently has no cookies to save.',
    errSaveLocalTitle: 'Save failed',
    errUnknown: 'Unknown error',
    savedOverwriteTitle: 'Overwritten!',
    savedLocalTitle: 'Saved locally!',
    restorePartialTitle: 'Partially restored',
    restorePartialDesc: (ok, fail) => `${ok} succeeded, ${fail} failed`,
    restoreSuccessTitle: 'Restored!',
    restoreSuccessDesc: n => `${n} cookies — reloading tab...`,
    restoreErrTitle: 'Restore failed',
    copySuccessTitle: 'Copied!',
    copySuccessDesc: n => `${n} cookies copied to clipboard`,
    copyErrTitle: 'Copy failed',
    copyErrDesc: 'Browser denied clipboard access.',
    exportJsonTitle: 'JSON exported',
    exportJsonDesc: label => `"${label}" downloaded`,
    delSnapTitle: 'Delete this snapshot?',
    delSnapBody: 'This action cannot be undone.',
    delSnapConfirm: 'Delete snapshot',
    delErrTitle: 'Delete failed',
    delSuccessTitle: 'Snapshot deleted',

    invalidJsonTypeTitle: 'Invalid file',
    invalidJsonTypeDesc: 'Only .json files are supported.',
    readFileErrTitle: 'Failed to read file',
    invalidJsonDesc: msg => `Invalid JSON file: ${msg}`,
    unsupportedFormatTitle: 'Unsupported format',
    unsupportedJsonFormatDesc: 'File must contain a cookies array or valid snapshot object.',
    emptyDataTitle: 'No data',
    emptyJsonCookiesDesc: 'No cookies found in this file.',
    importDialogTitle: 'Import cookies from JSON',
    importLabel: 'Snapshot name',
    importPlaceholder: 'Enter snapshot name...',
    importValidate: 'Please enter a snapshot name',
    importBtn: 'Import',
    importSuccessTitle: 'Imported!',
    importSuccessDesc: n => `Saved ${n} ${n === 1 ? 'snapshot' : 'snapshots'}`,

    liveSearchPlaceholder: 'Search by name, value, domain...',
    liveSearchClearTitle: 'Clear search',
    btnCopyAllLiveTitle: 'Copy all cookies as key=value; ...',
    langToggleTitle: 'Click to switch to Tiếng Việt',
    loadingLive: 'Reading cookies...',
    emptyLiveSystem: 'System pages do not expose web cookies.<br>Open an HTTP/HTTPS website to inspect cookies.',
    emptyLiveNone: 'No cookies found for this website.',
    emptyLiveSearch: 'No cookies match your search query.',
    expandValTitle: 'Click to expand / collapse',
    btnCopyCookieTitle: 'Copy cookie',
    btnDeleteShort: 'Delete',
    delCookieTitle: name => `Delete cookie "${name}"?`,
    delCookieBody: 'This cookie will be removed from your browser.',
    delCookieConfirm: 'Delete cookie',
    delCookieErr: 'Unable to delete cookie',

    logoutCantTitle: 'Cannot sign out',
    logoutHttpOnlyDesc: 'Sign out only works on HTTP/HTTPS websites.',
    logoutNoCookiesDesc: 'This website currently has no cookies.',
    logoutConfirmTitle: host => `Sign out from ${host}?`,
    logoutConfirmBody: n => `This will expire ${n} cookies on the current site and reload the tab.`,
    logoutConfirmBtn: 'Sign out',
    logoutSuccessTitle: 'Signed out!',
    logoutSuccessDesc: n => `Expired ${n} cookies — reloading tab...`,
    logoutErrTitle: 'Sign out failed',

    privacyPill: '100% local on your device — zero external servers or tracking',
    statCookies: 'Browser cookies',
    statSites: 'Websites',
    statSnaps: 'Saved snapshots',
    exportSectionTitle: 'Export backup file (.bak)',
    bakNameLabel: 'File name (optional)',
    bakNamePlaceholder: 'e.g. cookie-backup-2026-11-25',
    bakPwLabelHtml: 'AES-256 encryption password <span class="field-opt">(leave empty for plain)</span>',
    bakPwPlaceholder: 'Optional password to protect backup...',
    bakPwToggleTitle: 'Show/hide password',
    btnExportBak: 'Download backup file (.bak)',
    restoreSectionTitle: 'Restore from file (.bak)',
    dropBakHtml: 'Drop a <strong>.bak</strong> file here or <strong>click to browse</strong>',
    dropBakSub: 'Supports both AES-256 encrypted and unencrypted backups',

    collectErrTitle: 'Failed to collect data',
    emptyBackupWarnTitle: 'Nothing to back up',
    emptyBackupWarnDesc: 'No browser cookies or saved snapshots found.',
    exportedBakTitle: fname => `Exported ${fname}`,
    exportedBakDesc: (c, s, enc) => `${c} cookies · ${s} snapshots${enc ? ' (AES-256 encrypted)' : ''}`,
    notJsonDesc: 'File content is not valid JSON.',
    wrongMagicTitle: 'Invalid backup format',
    wrongMagicDesc: 'This file is not a valid Cookie Manager backup.',
    decryptTitle: 'Decrypt backup file',
    decryptSub: 'This backup is protected with AES-256 encryption',
    decryptLabel: 'Decryption password',
    decryptPlaceholder: 'Enter password...',
    decryptValidate: 'Please enter the password to decrypt',
    decryptBtn: 'Decrypt',
    wrongPwTitle: 'Wrong password',
    wrongPwDesc: 'Could not decrypt this backup file.',
    restoreConfirmTitle: 'Confirm restore',
    restoreConfirmSub: 'Data will be written to your browser',
    restoreDateLabel: 'Backup date',
    unknownDate: 'Unknown',
    restoreCookiesLabel: 'Browser cookies',
    restoreCookiesVal: (c, d) => `${c} cookies / ${d} sites`,
    restoreSnapsLabel: 'Saved snapshots',
    restoreSnapsVal: s => `${s} ${s === 1 ? 'snapshot' : 'snapshots'}`,
    restoreWarn: 'Cookies will be written directly into the browser. This action cannot be undone.',
    restoreNowBtn: 'Restore now',
    emptyFileTitle: 'Empty backup',
    emptyFileDesc: 'No cookies or snapshots found in this backup.',
    restoreCookieErr: 'Failed to restore cookies',
    restoreDetailHeader: (count, more) => `Error details (${count}${more ? '+' : ''}):`,
    restoreSummarySnaps: (added, ov) => `${added} new, ${ov} overwritten`,
    restoreDoneTitle: 'Restore completed!',

    footerPrefix: 'Local storage only · Built by ',
    cancelBtn: 'Cancel',
    confirmBtn: 'Confirm'
  },
  vi: {
    pageTitle: 'Cookie Manager',
    loadingTab: 'Đang tải trang hiện tại...',
    systemSite: host => `Trang hệ thống (${host || 'không hỗ trợ'})`,
    unknownTab: 'Không xác định được trang hiện tại',
    liveBadge: 'Live',
    tabSaved: 'Đã lưu',
    tabLive: 'Hiện tại',
    tabBackup: 'Sao lưu',

    snapNamePlaceholder: 'Tên phiên cookie (để trống để ghi đè)...',
    snapNameRequiredPlaceholder: 'Vui lòng nhập tên snapshot...',
    snapNameNewPlaceholder: 'Nhập tên snapshot mới...',
    btnSave: 'Lưu',
    btnImportJson: 'Import JSON',
    btnLogout: 'Đăng xuất',
    btnLogoutTitle: 'Đặt tất cả cookie trang này hết hạn để đăng xuất',
    onlyCurrentSite: 'Chỉ web này',
    onlyCurrentSiteTitle: 'Chỉ hiển thị snapshot thuộc trang web đang mở',
    btnReloadTitle: 'Tải lại danh sách',
    dropJsonHtml: 'Kéo thả file <strong>.json</strong> vào đây hoặc nhấn để chọn file',
    loadingList: 'Đang tải danh sách...',
    emptySavedAll: 'Chưa có phiên cookie nào được lưu.<br>Nhập tên và nhấn <strong>Lưu</strong> hoặc <strong>Import JSON</strong>.',
    emptySavedSite: 'Chưa có snapshot nào cho trang web hiện tại.',
    showAllSites: 'Hiển thị tất cả trang',
    currentSitePill: '● Trang hiện tại',
    tagActive: 'Đang dùng',
    tagLegacy: 'Đồng bộ cũ',
    tagImport: 'Import',
    cookiesCount: n => `${n} cookies`,
    btnRestore: 'Khôi phục',
    btnCopy: 'Copy',
    btnCopied: 'Đã copy',
    btnCopyTitle: 'Copy chuỗi Cookie header',
    btnExportJsonTitle: 'Xuất file JSON',
    btnDeleteSnapTitle: 'Xoá snapshot này',

    overwriteTitle: 'Ghi đè snapshot',
    overwriteSub: n => `Chọn phiên muốn ghi đè (${n} cookies hiện tại)`,
    overwriteNewBtn: '+ Nhập tên để tạo phiên mới',
    closeLabel: 'Đóng',

    errLoadDataTitle: 'Lỗi tải dữ liệu',
    errLoadDataDesc: 'Không đọc được dữ liệu đã lưu.',
    errCannotSaveTitle: 'Không thể lưu',
    errHttpOnlySaveDesc: 'Chỉ hỗ trợ lưu cookie trên các trang web HTTP/HTTPS.',
    errNoCookiesTitle: 'Không có cookie',
    errNoCookiesSiteDesc: 'Trang này chưa có cookie nào để lưu.',
    errSaveLocalTitle: 'Lỗi lưu dữ liệu',
    errUnknown: 'Không xác định',
    savedOverwriteTitle: 'Đã ghi đè!',
    savedLocalTitle: 'Đã lưu cục bộ!',
    restorePartialTitle: 'Khôi phục một phần',
    restorePartialDesc: (ok, fail) => `${ok} thành công, ${fail} lỗi`,
    restoreSuccessTitle: 'Khôi phục xong!',
    restoreSuccessDesc: n => `${n} cookies — đang tải lại trang...`,
    restoreErrTitle: 'Lỗi khôi phục',
    copySuccessTitle: 'Đã copy!',
    copySuccessDesc: n => `${n} cookies vào clipboard`,
    copyErrTitle: 'Không thể copy',
    copyErrDesc: 'Trình duyệt từ chối quyền clipboard.',
    exportJsonTitle: 'Đã xuất JSON',
    exportJsonDesc: label => `"${label}" đã tải về máy`,
    delSnapTitle: 'Xoá snapshot này?',
    delSnapBody: 'Hành động này không thể hoàn tác.',
    delSnapConfirm: 'Xoá snapshot',
    delErrTitle: 'Lỗi xoá dữ liệu',
    delSuccessTitle: 'Đã xoá snapshot',

    invalidJsonTypeTitle: 'File không hợp lệ',
    invalidJsonTypeDesc: 'Chỉ hỗ trợ file .json',
    readFileErrTitle: 'Lỗi đọc file',
    invalidJsonDesc: msg => `File JSON không hợp lệ: ${msg}`,
    unsupportedFormatTitle: 'Định dạng không hỗ trợ',
    unsupportedJsonFormatDesc: 'File cần chứa mảng cookies hoặc snapshot hợp lệ.',
    emptyDataTitle: 'Không có dữ liệu',
    emptyJsonCookiesDesc: 'Không tìm thấy cookie nào trong file.',
    importDialogTitle: 'Import Cookie từ JSON',
    importLabel: 'Tên để lưu',
    importPlaceholder: 'Nhập tên snapshot...',
    importValidate: 'Vui lòng nhập tên snapshot',
    importBtn: 'Import',
    importSuccessTitle: 'Import thành công!',
    importSuccessDesc: n => `Đã lưu ${n} snapshot`,

    liveSearchPlaceholder: 'Tìm theo tên, giá trị, domain...',
    liveSearchClearTitle: 'Xoá từ khoá',
    btnCopyAllLiveTitle: 'Copy tất cả cookie dạng key=value; ...',
    langToggleTitle: 'Nhấn để chuyển sang English',
    loadingLive: 'Đang đọc cookie...',
    emptyLiveSystem: 'Trang hệ thống không hỗ trợ xem cookie.<br>Hãy mở một trang web HTTP/HTTPS.',
    emptyLiveNone: 'Không tìm thấy cookie nào cho trang này.',
    emptyLiveSearch: 'Không tìm thấy cookie khớp từ khoá.',
    expandValTitle: 'Nhấn để mở rộng / thu gọn',
    btnCopyCookieTitle: 'Copy cookie',
    btnDeleteShort: 'Xoá',
    delCookieTitle: name => `Xoá cookie "${name}"?`,
    delCookieBody: 'Cookie này sẽ bị xoá khỏi trình duyệt.',
    delCookieConfirm: 'Xoá cookie',
    delCookieErr: 'Không thể xoá',

    logoutCantTitle: 'Không thể đăng xuất',
    logoutHttpOnlyDesc: 'Chỉ hỗ trợ trên các trang web HTTP/HTTPS.',
    logoutNoCookiesDesc: 'Trang này chưa có cookie nào.',
    logoutConfirmTitle: host => `Đăng xuất khỏi ${host}?`,
    logoutConfirmBody: n => `Sẽ đặt hết hạn ${n} cookie của trang hiện tại và tải lại trang.`,
    logoutConfirmBtn: 'Đăng xuất ngay',
    logoutSuccessTitle: 'Đã đăng xuất!',
    logoutSuccessDesc: n => `Đặt hết hạn ${n} cookies — đang tải lại trang...`,
    logoutErrTitle: 'Lỗi đăng xuất',

    privacyPill: 'Xử lý 100% cục bộ trên máy — không tải dữ liệu lên máy chủ ngoài',
    statCookies: 'Cookies trình duyệt',
    statSites: 'Trang web',
    statSnaps: 'Snapshots đã lưu',
    exportSectionTitle: 'Xuất file sao lưu (.bak)',
    bakNameLabel: 'Tên file (tuỳ chọn)',
    bakNamePlaceholder: 'vd: cookie-backup-2026-11-25',
    bakPwLabelHtml: 'Mật khẩu mã hoá AES-256 <span class="field-opt">(để trống nếu không mã hoá)</span>',
    bakPwPlaceholder: 'Nhập mật khẩu bảo vệ file backup...',
    bakPwToggleTitle: 'Hiện/ẩn mật khẩu',
    btnExportBak: 'Tải xuống file sao lưu (.bak)',
    restoreSectionTitle: 'Khôi phục từ file (.bak)',
    dropBakHtml: 'Kéo thả file <strong>.bak</strong> vào đây hoặc <strong>nhấn để chọn</strong>',
    dropBakSub: 'Tự động nhận diện file mã hoá AES-256 hoặc file thường',

    collectErrTitle: 'Lỗi thu thập dữ liệu',
    emptyBackupWarnTitle: 'Không có dữ liệu',
    emptyBackupWarnDesc: 'Trình duyệt chưa có cookie hoặc snapshot nào để sao lưu.',
    exportedBakTitle: fname => `Đã xuất ${fname}`,
    exportedBakDesc: (c, s, enc) => `${c} cookies · ${s} snapshots${enc ? ' (đã mã hoá AES-256)' : ''}`,
    notJsonDesc: 'Nội dung file không phải JSON hợp lệ.',
    wrongMagicTitle: 'Sai định dạng',
    wrongMagicDesc: 'File này không phải bản sao lưu hợp lệ từ Cookie Manager.',
    decryptTitle: 'Giải mã file sao lưu',
    decryptSub: 'File này được bảo vệ bằng AES-256',
    decryptLabel: 'Mật khẩu giải mã',
    decryptPlaceholder: 'Nhập mật khẩu...',
    decryptValidate: 'Vui lòng nhập mật khẩu để giải mã',
    decryptBtn: 'Giải mã',
    wrongPwTitle: 'Sai mật khẩu',
    wrongPwDesc: 'Không thể giải mã file sao lưu này.',
    restoreConfirmTitle: 'Xác nhận khôi phục',
    restoreConfirmSub: 'Dữ liệu sẽ được ghi vào trình duyệt',
    restoreDateLabel: 'Ngày sao lưu',
    unknownDate: 'Không rõ',
    restoreCookiesLabel: 'Cookie trình duyệt',
    restoreCookiesVal: (c, d) => `${c} cookies / ${d} trang`,
    restoreSnapsLabel: 'Snapshots lưu sẵn',
    restoreSnapsVal: s => `${s} snapshots`,
    restoreWarn: 'Cookie sẽ được ghi trực tiếp vào trình duyệt. Hành động này không thể hoàn tác.',
    restoreNowBtn: 'Khôi phục ngay',
    emptyFileTitle: 'File trống',
    emptyFileDesc: 'Không có cookie hay snapshot nào trong bản sao lưu này.',
    restoreCookieErr: 'Lỗi khôi phục cookie',
    restoreDetailHeader: (count, more) => `Chi tiết lỗi (${count}${more ? '+' : ''}):`,
    restoreSummarySnaps: (added, ov) => `${added} snap mới, ${ov} ghi đè`,
    restoreDoneTitle: 'Khôi phục thành công!',

    footerPrefix: 'Lưu trữ cục bộ · Phát triển bởi ',
    cancelBtn: 'Huỷ',
    confirmBtn: 'Xác nhận'
  }
};

function t(key, ...args) {
  const dict = I18N[currentLang] || I18N.en;
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}

function dateLocale() {
  return currentLang === 'vi' ? 'vi-VN' : 'en-US';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = el => { if (el) el.style.display = ''; };
const hide = el => { if (el) el.style.display = 'none'; };
const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function sendBg(payload) {
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage(payload, res => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        resolve(res || { success: false, error: 'Background did not respond' });
      });
    } catch (e) {
      resolve({ success: false, error: e.message });
    }
  });
}

function cookieSiteKey(origin) {
  try { return new URL(origin).hostname.toLowerCase().replace(/^www\./, ''); }
  catch { return String(origin || '').toLowerCase().replace(/^www\./, ''); }
}

function siteMonogramStyle(hostname) {
  const palette = [
    { bg: '#EFF6FF', fg: '#1D4ED8', bd: '#BFDBFE' },
    { bg: '#FFF7ED', fg: '#C2410C', bd: '#FED7AA' },
    { bg: '#F0FDF4', fg: '#15803D', bd: '#BBF7D0' },
    { bg: '#F5F3FF', fg: '#6D28D9', bd: '#DDD6FE' },
    { bg: '#ECFEFF', fg: '#0E7490', bd: '#A5F3FC' },
    { bg: '#FEFCE8', fg: '#A16207', bd: '#FDE68A' }
  ];
  let hash = 0;
  for (let i = 0; i < hostname.length; i++) {
    hash = ((hash << 5) - hash) + hostname.charCodeAt(i);
    hash |= 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

// ── Inline SVG Icons (consistent 2px Lucide-style stroke) ─────────────────────
const ICONS = {
  checkCircle: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  alertTriangle: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  xCircle: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
  info: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  restore: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  copy: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  check: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  download: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  clock: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  trash: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  cookie: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  lock: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  eye: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>'
};

function makeBtn(html, cls, fn, titleText = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.innerHTML = html;
  if (titleText) {
    b.title = titleText;
    b.setAttribute('aria-label', titleText);
  }
  b.addEventListener('click', fn);
  return b;
}

// ── Language Application ──────────────────────────────────────────────────────
function applyStaticI18n() {
  document.documentElement.lang = currentLang;
  document.title = t('pageTitle');

  $('lang-en').classList.toggle('active', currentLang === 'en');
  $('lang-vi').classList.toggle('active', currentLang === 'vi');
  $('btn-lang-toggle').title = t('langToggleTitle');
  $('btn-lang-toggle').setAttribute('aria-label', t('langToggleTitle'));

  $('hdr-badge-text').textContent = t('liveBadge');
  $('lbl-tab-saved').textContent = t('tabSaved');
  $('lbl-tab-live').textContent = t('tabLive');
  $('lbl-tab-backup').textContent = t('tabBackup');

  $('snap-name').placeholder = t('snapNamePlaceholder');
  $('lbl-btn-save').textContent = t('btnSave');
  $('lbl-btn-import').textContent = t('btnImportJson');
  $('lbl-btn-logout').textContent = t('btnLogout');
  $('btn-logout').title = t('btnLogoutTitle');
  $('lbl-only-site').textContent = t('onlyCurrentSite');
  $('wrap-filter-toggle').title = t('onlyCurrentSiteTitle');
  $('btn-reload-saved').title = t('btnReloadTitle');
  $('btn-reload-saved').setAttribute('aria-label', t('btnReloadTitle'));
  $('lbl-drop-json').innerHTML = t('dropJsonHtml');
  $('lbl-saved-loading').textContent = t('loadingList');

  $('live-search').placeholder = t('liveSearchPlaceholder');
  $('live-search-clear').title = t('liveSearchClearTitle');
  $('live-search-clear').setAttribute('aria-label', t('liveSearchClearTitle'));
  $('lbl-btn-copy-all-live').textContent = t('btnCopy');
  $('btn-copy-all-live').title = t('btnCopyAllLiveTitle');
  $('btn-copy-all-live').setAttribute('aria-label', t('btnCopyAllLiveTitle'));
  $('lbl-live-loading').textContent = t('loadingLive');

  $('lbl-privacy-pill').textContent = t('privacyPill');
  $('lbl-stat-cookies').textContent = t('statCookies');
  $('lbl-stat-sites').textContent = t('statSites');
  $('lbl-stat-snaps').textContent = t('statSnaps');
  $('lbl-export-title').textContent = t('exportSectionTitle');
  $('lbl-bak-name').textContent = t('bakNameLabel');
  $('bak-backup-name').placeholder = t('bakNamePlaceholder');
  $('lbl-bak-pw').innerHTML = t('bakPwLabelHtml');
  $('bak-export-password').placeholder = t('bakPwPlaceholder');
  $('btn-toggle-bak-pw').title = t('bakPwToggleTitle');
  $('btn-toggle-bak-pw').setAttribute('aria-label', t('bakPwToggleTitle'));
  $('lbl-btn-export-bak').textContent = t('btnExportBak');
  $('lbl-restore-title').textContent = t('restoreSectionTitle');
  $('lbl-drop-bak').innerHTML = t('dropBakHtml');
  $('lbl-drop-bak-sub').textContent = t('dropBakSub');

  $('lbl-footer-prefix').textContent = t('footerPrefix');

  renderHeaderSub();
}

function renderHeaderSub() {
  if (!activeTab) {
    $('hdr-sub').textContent = t('unknownTab');
    hide($('hdr-badge'));
    return;
  }
  if (activeTab.success && activeTab.isSupportedSite) {
    $('hdr-sub').innerHTML = `<span class="pulse-dot" aria-hidden="true"></span><span>${esc(activeTab.hostname)}</span>`;
    show($('hdr-badge'));
  } else if (activeTab.success) {
    $('hdr-sub').textContent = t('systemSite', activeTab.hostname);
    hide($('hdr-badge'));
  } else {
    $('hdr-sub').textContent = t('unknownTab');
    hide($('hdr-badge'));
  }
}

async function setLanguage(lang) {
  currentLang = lang === 'vi' ? 'vi' : 'en';
  await chrome.storage.local.set({ uiLang: currentLang });
  applyStaticI18n();

  const activePanel = document.querySelector('.tab.active')?.dataset.tab || 'saved';
  if (activePanel === 'saved') loadSaved();
  else if (activePanel === 'live') loadLive();
  else if (activePanel === 'backup') {
    loadSaved();
    initBackup();
  }
}

$('btn-lang-toggle').addEventListener('click', () => {
  setLanguage(currentLang === 'en' ? 'vi' : 'en');
});

// ── Toast system ──────────────────────────────────────────────────────────────
(function ensureToastContainer() {
  if ($('toast-container')) return;
  const c = document.createElement('div');
  c.id = 'toast-container';
  document.body.appendChild(c);
})();

function showToast(type, title, text) {
  const iconMap = {
    success: ICONS.checkCircle,
    warning: ICONS.alertTriangle,
    error: ICONS.xCircle,
    info: ICONS.info
  };
  const clsMap = {
    warning: ' warn',
    error: ' error',
    info: ' info'
  };
  const c = $('toast-container');
  const tItem = document.createElement('div');
  tItem.className = 'toast-item' + (clsMap[type] || '');
  tItem.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${iconMap[type] || ICONS.info}</span>
    <div class="toast-body">
      <span class="toast-title">${esc(title)}</span>
      ${text ? `<span class="toast-text">${esc(text)}</span>` : ''}
    </div>`;
  const delay = type === 'error' ? 4200 : 2900;
  c.appendChild(tItem);
  setTimeout(() => tItem.remove(), delay);
  return Promise.resolve();
}

function swalSuccess(title, text) { return showToast('success', title, text); }
function swalWarn(title, text) { return showToast('warning', title, text); }

// ── Reusable Dialog Modal ─────────────────────────────────────────────────────
function openAppDialog({
  tone = 'info',
  icon = ICONS.info,
  title = '',
  subtitle = '',
  body = '',
  showCancel = false,
  confirmText = t('okBtn') || 'OK',
  cancelText = t('cancelBtn'),
  confirmClass = 'btn-primary',
  input = null
}) {
  return new Promise(resolve => {
    const overlay = $('app-dialog-overlay');
    const icoEl = $('dlg-ico');
    const titleEl = $('dlg-title');
    const subEl = $('dlg-sub');
    const bodyEl = $('dlg-body');
    const inputWrap = $('dlg-input-wrap');
    const inputLbl = $('dlg-input-label');
    const inputEl = $('dlg-input');
    const errEl = $('dlg-err');
    const cancelBtn = $('dlg-cancel');
    const okBtn = $('dlg-ok');

    icoEl.className = 'modal-ico' + (tone === 'danger' ? ' danger' : tone === 'warn' ? ' warn' : tone === 'accent' ? ' accent' : '');
    icoEl.innerHTML = icon;

    titleEl.textContent = title;
    if (subtitle) {
      subEl.textContent = subtitle;
      show(subEl);
    } else {
      subEl.textContent = '';
      hide(subEl);
    }

    bodyEl.textContent = body || '';

    if (input) {
      show(inputWrap);
      inputLbl.textContent = input.label || '';
      inputEl.type = input.type || 'text';
      inputEl.value = input.value || '';
      inputEl.placeholder = input.placeholder || '';
    } else {
      hide(inputWrap);
      inputEl.value = '';
    }
    hide(errEl);
    errEl.textContent = '';

    cancelBtn.textContent = cancelText;
    cancelBtn.style.display = showCancel ? '' : 'none';
    okBtn.textContent = confirmText;
    okBtn.className = 'btn ' + confirmClass;

    overlay.classList.remove('hidden');

    const cleanup = () => {
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKeyDown);
      inputEl.removeEventListener('keydown', onInputKey);
      overlay.classList.add('hidden');
    };

    const finish = result => {
      cleanup();
      resolve(result);
    };

    const onOk = () => {
      if (input && typeof input.validate === 'function') {
        const msg = input.validate(inputEl.value);
        if (msg) {
          errEl.textContent = msg;
          show(errEl);
          inputEl.focus();
          return;
        }
      }
      finish({ confirmed: true, value: input ? inputEl.value : undefined });
    };

    const onCancel = () => finish({ confirmed: false, value: undefined });
    const onBackdrop = e => { if (e.target === overlay) onCancel(); };
    const onKeyDown = e => { if (e.key === 'Escape') onCancel(); };
    const onInputKey = e => { if (e.key === 'Enter') { e.preventDefault(); onOk(); } };

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKeyDown);
    if (input) {
      inputEl.addEventListener('keydown', onInputKey);
      setTimeout(() => { inputEl.focus(); inputEl.select(); }, 30);
    } else {
      setTimeout(() => okBtn.focus(), 30);
    }
  });
}

function swalError(title, text) {
  return openAppDialog({
    tone: 'danger',
    icon: ICONS.xCircle,
    title,
    body: text || '',
    showCancel: false,
    confirmText: t('closeLabel'),
    confirmClass: 'btn-primary'
  });
}

async function swalConfirm(title, text, confirmText = t('confirmBtn'), tone = 'warn') {
  const isDanger = tone === 'danger' || tone === 'warning';
  const res = await openAppDialog({
    tone: tone === 'warning' ? 'danger' : tone,
    icon: isDanger ? ICONS.alertTriangle : ICONS.info,
    title,
    body: text || '',
    showCancel: true,
    confirmText,
    cancelText: t('cancelBtn'),
    confirmClass: isDanger ? 'btn-danger' : 'btn-primary'
  });
  return { isConfirmed: res.confirmed };
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function switchToTab(tabName) {
  document.querySelectorAll('.tab').forEach(tabEl => {
    const active = tabEl.dataset.tab === tabName;
    tabEl.classList.toggle('active', active);
    tabEl.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.querySelectorAll('.panel').forEach(p => {
    p.classList.toggle('active', p.id === 'panel-' + tabName);
  });

  if (tabName === 'saved') loadSaved();
  if (tabName === 'live') initLive();
  if (tabName === 'backup') initBackup();
}

document.querySelectorAll('.tab').forEach(tabEl => {
  tabEl.addEventListener('click', () => switchToTab(tabEl.dataset.tab));
});

// ── Init ──────────────────────────────────────────────────────────────────────
(async function initPopup() {
  const stored = await chrome.storage.local.get(['onlyCurrentSite', 'uiLang']);
  onlyCurrentSite = !!(stored && stored.onlyCurrentSite);
  currentLang = stored && stored.uiLang === 'vi' ? 'vi' : 'en';

  const toggle = $('toggle-current-site');
  if (toggle) toggle.checked = onlyCurrentSite;

  applyStaticI18n();

  const res = await sendBg({ action: 'getActiveTab' });
  activeTab = res;
  renderHeaderSub();

  loadSaved();
  refreshLiveCountBadge();
})();

async function refreshLiveCountBadge() {
  const badge = $('tab-live-count');
  if (!badge) return;
  if (!activeTab || !activeTab.success || !activeTab.isSupportedSite) {
    hide(badge);
    return;
  }
  const res = await sendBg({ action: 'getCookiesForUrl', url: activeTab.url });
  if (res && res.success && Array.isArray(res.cookies)) {
    badge.textContent = String(res.cookies.length);
    show(badge);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: SAVED SNAPSHOTS
// ═══════════════════════════════════════════════════════════════════════════════
function renderSavedEmpty(message, showResetBtn = false) {
  const emptyEl = $('saved-empty');
  emptyEl.innerHTML = `
    <div class="empty-ico" aria-hidden="true">${ICONS.package}</div>
    <div class="empty-txt">${message}</div>
    ${showResetBtn ? `<div class="empty-action"><button type="button" class="btn btn-neutral btn-sm" id="btn-show-all-sites">${esc(t('showAllSites'))}</button></div>` : ''}
  `;
  show(emptyEl);

  const resetBtn = $('btn-show-all-sites');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      onlyCurrentSite = false;
      const toggle = $('toggle-current-site');
      if (toggle) toggle.checked = false;
      chrome.storage.local.set({ onlyCurrentSite: false });
      loadSaved();
    });
  }
}

async function loadSaved() {
  $('saved-content').innerHTML = '';
  hide($('saved-empty'));
  show($('saved-loading'));

  const res = await sendBg({ action: 'getSavedAll' });
  hide($('saved-loading'));

  if (!res || !res.success) {
    swalError(t('errLoadDataTitle'), res?.error || t('errLoadDataDesc'));
    return;
  }

  const snaps = res.snapshots || {};
  const keys = Object.keys(snaps);

  const countBadge = $('tab-saved-count');
  if (countBadge) {
    countBadge.textContent = String(keys.length);
    if (keys.length > 0) show(countBadge);
    else hide(countBadge);
  }

  if (!keys.length) {
    renderSavedEmpty(t('emptySavedAll'));
    return;
  }

  const tRes = await chrome.storage.local.get('activeCookieSessions');
  const activeCookieSessions = (tRes && tRes.activeCookieSessions) || {};

  const groups = {};
  keys.forEach(k => {
    const s = snaps[k];
    if (!s || !s.origin) return;
    if (!groups[s.origin]) groups[s.origin] = [];
    groups[s.origin].push(s);
  });

  let originOrder = Object.keys(groups).sort((a, b) => {
    if (activeTab && activeTab.origin && a === activeTab.origin) return -1;
    if (activeTab && activeTab.origin && b === activeTab.origin) return 1;
    return a.localeCompare(b);
  });

  if (onlyCurrentSite) {
    if (activeTab && activeTab.isSupportedSite && activeTab.origin) {
      originOrder = originOrder.filter(origin => origin === activeTab.origin);
    } else {
      originOrder = [];
    }
  }

  if (!originOrder.length) {
    renderSavedEmpty(t('emptySavedSite'), true);
    return;
  }

  const container = $('saved-content');

  originOrder.forEach(origin => {
    const group = groups[origin];
    const hostname = (() => { try { return new URL(origin).hostname; } catch { return origin; } })();
    const siteKey = hostname.toLowerCase().replace(/^www\./, '');
    const activeSnapId = activeCookieSessions[siteKey] || null;
    const isCurrent = Boolean(activeTab && activeTab.origin && origin === activeTab.origin);
    const mono = siteMonogramStyle(hostname);
    const initial = (hostname.replace(/^www\./, '')[0] || '?').toUpperCase();

    const label = document.createElement('div');
    label.className = 'site-label';
    label.innerHTML = `
      <span class="site-monogram" style="background:${mono.bg};color:${mono.fg};border-color:${mono.bd}" aria-hidden="true">${esc(initial)}</span>
      <span>${esc(hostname)}</span>
      ${isCurrent ? `<span class="site-current-pill">${esc(t('currentSitePill'))}</span>` : ''}
    `;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'site-group';
    groupDiv.appendChild(label);

    group.sort((a, b) => {
      const aAct = activeSnapId && String(a.id || a.label || '') === activeSnapId ? 0 : 1;
      const bAct = activeSnapId && String(b.id || b.label || '') === activeSnapId ? 0 : 1;
      if (aAct !== bAct) return aAct - bAct;
      return String(a.label || '').localeCompare(String(b.label || ''));
    });

    group.forEach(s => {
      const isImported = s.imported === true;
      const isLegacySync = s.fromCloud === true;
      const isActive = Boolean(activeSnapId && String(s.id || s.label || '') === activeSnapId);

      const card = document.createElement('div');
      card.className = 'scard'
        + (isActive ? ' active-snap' : (isLegacySync ? ' legacy-sync' : (isImported ? ' imported' : '')));
      card.dataset.key = s.key;

      const row1 = document.createElement('div');
      row1.className = 'scard-row1';

      const dot = document.createElement('span');
      dot.className = 'status-dot ' + (isActive ? 'amber' : (isLegacySync ? 'purple' : (isImported ? 'blue' : 'green')));
      dot.dataset.dotKey = s.key;

      const nameEl = document.createElement('div');
      nameEl.className = 'scard-name';
      nameEl.textContent = s.label;
      nameEl.title = s.label;

      row1.appendChild(dot);
      row1.appendChild(nameEl);

      if (isActive) {
        const activeBadge = document.createElement('span');
        activeBadge.className = 'tag-badge tag-active';
        activeBadge.textContent = t('tagActive');
        row1.appendChild(activeBadge);
      }

      if (isLegacySync) {
        const lb = document.createElement('span');
        lb.className = 'tag-badge tag-legacy';
        lb.textContent = t('tagLegacy');
        row1.appendChild(lb);
      } else if (isImported) {
        const ib = document.createElement('span');
        ib.className = 'tag-badge tag-imported';
        ib.textContent = t('tagImport');
        row1.appendChild(ib);
      }

      const info = document.createElement('div');
      info.className = 'scard-info';
      const savedDate = s.savedAt ? new Date(s.savedAt).toLocaleString(dateLocale()) : '—';
      const cookieCount = typeof s.count === 'number' ? s.count : (Array.isArray(s.cookies) ? s.cookies.length : 0);
      info.innerHTML = `
        <span class="scard-meta-item">${ICONS.cookie}<span>${esc(t('cookiesCount', cookieCount))}</span></span>
        <span class="scard-meta-item">${ICONS.clock}<span>${esc(savedDate)}</span></span>
      `;

      const acts = document.createElement('div');
      acts.className = 'scard-actions';

      const restoreBtn = makeBtn(`${ICONS.restore}<span>${esc(t('btnRestore'))}</span>`, 'btn btn-primary btn-sm btn-grow', () => restoreSnap(s));
      const copyBtn = makeBtn(`${ICONS.copy}<span>${esc(t('btnCopy'))}</span>`, 'btn btn-neutral btn-sm', () => copySnap(s.cookies, copyBtn), t('btnCopyTitle'));
      const exportBtn = makeBtn(`${ICONS.download}<span>JSON</span>`, 'btn btn-soft-info btn-sm', () => exportSnap(s), t('btnExportJsonTitle'));
      const delBtn = makeBtn(ICONS.trash, 'btn btn-soft-danger btn-icon btn-sm', () => deleteSnap(s.key), t('btnDeleteSnapTitle'));

      acts.appendChild(restoreBtn);
      acts.appendChild(copyBtn);
      acts.appendChild(exportBtn);
      acts.appendChild(delBtn);

      card.appendChild(row1);
      card.appendChild(info);
      card.appendChild(acts);
      groupDiv.appendChild(card);
    });

    container.appendChild(groupDiv);
  });
}

// ── Overwrite Modal ───────────────────────────────────────────────────────────
function showOverwriteModal(siteSnaps, cookieCount, onChoose, onNew, onCancel) {
  const old = $('ow-modal-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ow-modal-overlay';
  overlay.className = 'overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const hdr = document.createElement('div');
  hdr.className = 'modal-hdr';
  hdr.innerHTML = `
    <div class="modal-ico accent" aria-hidden="true">${ICONS.restore}</div>
    <div style="flex:1;min-width:0">
      <h3>${esc(t('overwriteTitle'))}</h3>
      <p class="modal-sub">${esc(t('overwriteSub', cookieCount))}</p>
    </div>
  `;

  const closeBtn = makeBtn(
    '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    'btn btn-neutral btn-icon btn-sm',
    () => { overlay.remove(); onCancel(); },
    t('closeLabel')
  );
  hdr.appendChild(closeBtn);
  modal.appendChild(hdr);

  const list = document.createElement('div');
  list.style.cssText = 'max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:10px';

  siteSnaps.forEach(s => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'btn btn-neutral';
    row.style.cssText = 'width:100%;justify-content:space-between;padding:9px 11px;text-align:left';
    const date = s.savedAt ? new Date(s.savedAt).toLocaleString(dateLocale()) : '';
    const count = typeof s.count === 'number' ? s.count : (Array.isArray(s.cookies) ? s.cookies.length : 0);
    row.innerHTML = `
      <span style="flex:1;min-width:0;overflow:hidden">
        <span style="display:block;font-weight:700;color:var(--text);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.label)}</span>
        <span style="display:block;font-size:10px;color:var(--muted)">${esc(date)}</span>
      </span>
      <span class="badge badge-success" style="flex-shrink:0">${esc(t('cookiesCount', count))}</span>
    `;
    row.addEventListener('click', () => { overlay.remove(); onChoose(s.label); });
    list.appendChild(row);
  });
  modal.appendChild(list);

  const newBtn = makeBtn(esc(t('overwriteNewBtn')), 'btn btn-soft-info btn-full', () => {
    overlay.remove();
    onNew();
  });
  modal.appendChild(newBtn);

  overlay.appendChild(modal);
  overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); onCancel(); } });
  document.body.appendChild(overlay);
}

// ── Save Cookie Snapshot ──────────────────────────────────────────────────────
async function handleSaveClick() {
  const label = $('snap-name').value.trim();

  if (!activeTab || !activeTab.isSupportedSite) {
    swalError(t('errCannotSaveTitle'), t('errHttpOnlySaveDesc'));
    return;
  }

  const cookieRes = await sendBg({ action: 'getCookiesForUrl', url: activeTab.url });
  if (!cookieRes || !cookieRes.success || !cookieRes.cookies?.length) {
    swalError(t('errNoCookiesTitle'), t('errNoCookiesSiteDesc'));
    return;
  }
  const cookies = cookieRes.cookies;

  if (label) {
    await doSaveCookies(label, cookies, false);
    return;
  }

  const snapsRes = await chrome.storage.local.get('snapshots');
  const siteSnaps = Object.values(snapsRes.snapshots || {}).filter(s => s.origin === activeTab.origin);

  if (!siteSnaps.length) {
    $('snap-name').focus();
    $('snap-name').placeholder = t('snapNameRequiredPlaceholder');
    $('snap-name').style.borderColor = 'var(--danger-solid)';
    setTimeout(() => { $('snap-name').style.borderColor = ''; }, 1500);
    return;
  }

  showOverwriteModal(
    siteSnaps,
    cookies.length,
    chosenLabel => doSaveCookies(chosenLabel, cookies, true),
    () => {
      $('snap-name').focus();
      $('snap-name').placeholder = t('snapNameNewPlaceholder');
    },
    () => {}
  );
}

$('btn-save').addEventListener('click', handleSaveClick);
$('snap-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSaveClick();
  }
});

async function setActiveCookieSession(origin, id) {
  const site = cookieSiteKey(origin);
  if (!site || !id) return;
  const stored = await chrome.storage.local.get('activeCookieSessions');
  const activeCookieSessions = { ...(stored.activeCookieSessions || {}) };
  activeCookieSessions[site] = String(id);
  await chrome.storage.local.set({ activeCookieSessions });
}

async function clearActiveCookieSession(origin, expectedId = null) {
  const site = cookieSiteKey(origin);
  if (!site) return;
  const stored = await chrome.storage.local.get('activeCookieSessions');
  const activeCookieSessions = { ...(stored.activeCookieSessions || {}) };
  if (expectedId && activeCookieSessions[site] !== String(expectedId)) return;
  delete activeCookieSessions[site];
  await chrome.storage.local.set({ activeCookieSessions });
}

async function doSaveCookies(label, cookies, isOverwrite) {
  const r = await sendBg({
    action: 'saveCookies',
    label,
    origin: activeTab.origin,
    cookies
  });

  if (!r || !r.success) {
    swalError(t('errSaveLocalTitle'), r?.error || t('errUnknown'));
    return;
  }

  const verb = isOverwrite ? t('savedOverwriteTitle') : t('savedLocalTitle');
  swalSuccess(verb, `"${label}" — ${t('cookiesCount', cookies.length)}`);
  $('snap-name').value = '';
  $('snap-name').placeholder = t('snapNamePlaceholder');
  await setActiveCookieSession(activeTab.origin, label);
  loadSaved();
}

$('btn-reload-saved').addEventListener('click', loadSaved);

const currentSiteToggle = $('toggle-current-site');
if (currentSiteToggle) {
  currentSiteToggle.addEventListener('change', () => {
    onlyCurrentSite = currentSiteToggle.checked;
    chrome.storage.local.set({ onlyCurrentSite });
    loadSaved();
  });
}

// ── Snapshot Card Actions ─────────────────────────────────────────────────────
async function restoreSnap(s) {
  const r = await sendBg({ action: 'restoreCookies', cookies: s.cookies });
  if (r && r.success) {
    await setActiveCookieSession(s.origin, s.id || s.label);
    if (r.failed) {
      const sample = (r.failures || []).slice(0, 3).map(f =>
        `• ${f.name} @ ${f.domain}${f.path}: ${f.error}`
      ).join('\n');
      await swalWarn(t('restorePartialTitle'), `${t('restorePartialDesc', r.restored, r.failed)}${sample ? `\n\n${sample}` : ''}`);
    } else {
      await swalSuccess(t('restoreSuccessTitle'), t('restoreSuccessDesc', r.restored));
    }

    if (activeTab && activeTab.tabId) {
      chrome.tabs.reload(activeTab.tabId, {}, () => void chrome.runtime.lastError);
    }
    loadSaved();
    refreshLiveCountBadge();
  } else {
    swalError(t('restoreErrTitle'), r && r.error);
  }
}

function copySnap(cookies, btnEl = null) {
  const header = (cookies || []).map(c => c.name + '=' + c.value).join('; ');
  navigator.clipboard.writeText(header)
    .then(() => {
      swalSuccess(t('copySuccessTitle'), t('copySuccessDesc', cookies.length));
      if (btnEl) {
        if (!btnEl.dataset.origHtml) btnEl.dataset.origHtml = btnEl.innerHTML;
        if (btnEl._copyTimer) clearTimeout(btnEl._copyTimer);
        btnEl.classList.add('copied');
        btnEl.innerHTML = `${ICONS.check}<span>${esc(t('btnCopied'))}</span>`;
        btnEl._copyTimer = setTimeout(() => {
          btnEl.classList.remove('copied');
          btnEl.innerHTML = btnEl.dataset.origHtml;
          if (btnEl.id === 'btn-copy-all-live') {
            const lbl = $('lbl-btn-copy-all-live');
            if (lbl) lbl.textContent = t('btnCopy');
          }
          delete btnEl.dataset.origHtml;
          delete btnEl._copyTimer;
        }, 1200);
      }
    })
    .catch(() => swalError(t('copyErrTitle'), t('copyErrDesc')));
}

function exportSnap(s) {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cookies-' + String(s.label || 'snapshot').replace(/\s+/g, '-') + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  swalSuccess(t('exportJsonTitle'), t('exportJsonDesc', s.label));
}

async function deleteSnap(key) {
  const result = await swalConfirm(t('delSnapTitle'), t('delSnapBody'), t('delSnapConfirm'), 'danger');
  if (!result.isConfirmed) return;

  const snapsRes = await chrome.storage.local.get('snapshots');
  const snap = snapsRes.snapshots?.[key];

  const res = await sendBg({ action: 'deleteSnapshot', key });
  if (!res || !res.success) {
    swalError(t('delErrTitle'), res?.error || '');
    return;
  }

  if (snap) {
    await clearActiveCookieSession(snap.origin, snap.id || snap.label);
  }

  swalSuccess(t('delSuccessTitle'), snap?.label || '');
  loadSaved();
}

// ── Import JSON ───────────────────────────────────────────────────────────────
$('btn-import-json').addEventListener('click', () => { $('json-file-input').click(); });
$('import-zone').addEventListener('click', () => $('json-file-input').click());
$('import-zone').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    $('json-file-input').click();
  }
});

$('panel-saved').addEventListener('dragenter', e => {
  e.preventDefault();
  $('import-zone').classList.add('visible');
});
$('import-zone').addEventListener('dragover', e => {
  e.preventDefault();
  $('import-zone').classList.add('drag-over');
});
$('import-zone').addEventListener('dragleave', () => {
  $('import-zone').classList.remove('drag-over');
});
$('import-zone').addEventListener('drop', e => {
  e.preventDefault();
  $('import-zone').classList.remove('drag-over');
  $('import-zone').classList.remove('visible');
  const file = e.dataTransfer.files[0];
  if (file) handleImportFile(file);
});

$('json-file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleImportFile(file);
  e.target.value = '';
});

async function handleImportFile(file) {
  if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
    swalError(t('invalidJsonTypeTitle'), t('invalidJsonTypeDesc'));
    return;
  }
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    await processImportedJSON(data, file.name);
  } catch (e) {
    swalError(t('readFileErrTitle'), t('invalidJsonDesc', e.message));
  }
}

async function processImportedJSON(data, filename) {
  let snapshots = [];
  if (Array.isArray(data)) {
    if (data.length > 0 && data[0].name !== undefined && data[0].value !== undefined) {
      const origin = data[0].domain
        ? 'https://' + (data[0].domain.startsWith('.') ? data[0].domain.slice(1) : data[0].domain)
        : (activeTab && activeTab.origin ? activeTab.origin : 'https://unknown');
      const label = filename.replace(/\.json$/i, '') || 'Import';
      snapshots.push({ label, origin, cookies: data });
    } else {
      snapshots = data.filter(s => s && Array.isArray(s.cookies));
    }
  } else if (data && Array.isArray(data.cookies)) {
    snapshots.push(data);
  } else {
    swalError(t('unsupportedFormatTitle'), t('unsupportedJsonFormatDesc'));
    return;
  }

  if (!snapshots.length) {
    swalError(t('emptyDataTitle'), t('emptyJsonCookiesDesc'));
    return;
  }

  if (snapshots.length === 1) {
    const defaultOrigin = snapshots[0].origin || 'unknown';
    const dlg = await openAppDialog({
      tone: 'info',
      icon: ICONS.download,
      title: t('importDialogTitle'),
      subtitle: `${t('cookiesCount', snapshots[0].cookies.length)} · ${defaultOrigin}`,
      showCancel: true,
      confirmText: t('importBtn'),
      cancelText: t('cancelBtn'),
      input: {
        label: t('importLabel'),
        type: 'text',
        value: snapshots[0].label || filename.replace(/\.json$/i, ''),
        placeholder: t('importPlaceholder'),
        validate: val => !val.trim() ? t('importValidate') : ''
      }
    });
    if (!dlg.confirmed) return;
    snapshots[0].label = dlg.value.trim();
  }

  const r = await chrome.storage.local.get('snapshots');
  const snaps = { ...((r && r.snapshots) || {}) };

  snapshots.forEach((s, idx) => {
    const origin = s.origin || (activeTab && activeTab.origin ? activeTab.origin : 'https://imported');
    const label = s.label || ('Import ' + (idx + 1));
    const cookies = s.cookies || [];
    const key = origin + '::' + label;
    snaps[key] = {
      key,
      label,
      origin,
      cookies,
      count: cookies.length,
      savedAt: s.savedAt || new Date().toISOString(),
      imported: true
    };
  });

  await chrome.storage.local.set({ snapshots: snaps });
  swalSuccess(t('importSuccessTitle'), t('importSuccessDesc', snapshots.length));
  $('import-zone').classList.remove('visible');
  loadSaved();
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: LIVE COOKIES
// ═══════════════════════════════════════════════════════════════════════════════
function initLive() {
  loadLive();
}

function renderLiveEmpty(message) {
  const el = $('live-empty');
  el.innerHTML = `
    <div class="empty-ico" aria-hidden="true">${ICONS.search}</div>
    <div class="empty-txt">${message}</div>
  `;
  show(el);
}

async function loadLive() {
  hide($('live-list'));
  hide($('live-empty'));
  hide($('live-top-bar'));
  show($('live-loading'));

  if (!activeTab || !activeTab.success || !activeTab.isSupportedSite) {
    hide($('live-loading'));
    renderLiveEmpty(t('emptyLiveSystem'));
    return;
  }

  $('live-hostname').textContent = activeTab.hostname || activeTab.origin;
  show($('live-top-bar'));

  const res = await sendBg({ action: 'getCookiesForUrl', url: activeTab.url });
  hide($('live-loading'));

  if (!res || !res.success || !res.cookies.length) {
    liveCookies = [];
    hide($('btn-copy-all-live'));
    $('live-count-chip').textContent = t('cookiesCount', 0);
    const liveBadge = $('tab-live-count');
    if (liveBadge) { liveBadge.textContent = '0'; show(liveBadge); }
    renderLiveEmpty(t('emptyLiveNone'));
    return;
  }

  liveCookies = res.cookies;
  show($('btn-copy-all-live'));
  $('live-count-chip').textContent = t('cookiesCount', liveCookies.length);
  const liveBadge = $('tab-live-count');
  if (liveBadge) { liveBadge.textContent = String(liveCookies.length); show(liveBadge); }

  applyLiveSearch();
  show($('live-list'));
}

function applyLiveSearch() {
  const q = $('live-search').value.toLowerCase().trim();
  $('live-search-clear').style.display = q ? 'flex' : 'none';
  filteredLive = q
    ? liveCookies.filter(c =>
      c.name.toLowerCase().includes(q)
      || c.value.toLowerCase().includes(q)
      || c.domain.toLowerCase().includes(q)
    )
    : liveCookies.slice();
  renderLive();
}

function renderLive() {
  const list = $('live-list');
  list.innerHTML = '';
  if (!filteredLive.length) {
    list.innerHTML = `<div class="empty"><div class="empty-ico" aria-hidden="true">${ICONS.search}</div><div class="empty-txt">${esc(t('emptyLiveSearch'))}</div></div>`;
    return;
  }

  filteredLive.forEach(c => {
    const isLong = c.value.length > 80;
    const shortVal = isLong ? c.value.substring(0, 80) + '…' : c.value;

    const item = document.createElement('div');
    item.className = 'citem';

    const hdr = document.createElement('div');
    hdr.className = 'citem-hdr';

    const nameEl = document.createElement('div');
    nameEl.className = 'cname';
    nameEl.title = c.name;
    nameEl.textContent = c.name;

    const domEl = document.createElement('span');
    domEl.className = 'cdomain';
    domEl.textContent = c.domain;
    domEl.title = c.domain;

    hdr.appendChild(nameEl);
    hdr.appendChild(domEl);

    const valEl = document.createElement('div');
    valEl.className = 'cval';
    valEl.textContent = shortVal;
    if (isLong) {
      valEl.title = t('expandValTitle');
      valEl.addEventListener('click', () => {
        const open = valEl.classList.toggle('open');
        valEl.textContent = open ? c.value : shortVal;
      });
    }

    const foot = document.createElement('div');
    foot.className = 'cfoot';

    const badges = document.createElement('div');
    badges.className = 'cbadges';
    if (c.secure) mkBadge(badges, 'Secure', 'badge-success');
    if (c.httpOnly) mkBadge(badges, 'HttpOnly', 'badge-warn');
    if (c.session) mkBadge(badges, 'Session', 'badge-neutral');
    if (c.partitionKey) mkBadge(badges, 'Partitioned', 'badge-info');

    const actDiv = document.createElement('div');
    actDiv.className = 'citem-actions';

    const copyBtn = makeBtn(ICONS.copy, 'btn btn-neutral btn-icon btn-xs', () => {
      navigator.clipboard.writeText(c.name + '=' + c.value)
        .then(() => swalSuccess(t('copySuccessTitle'), `"${c.name}"`))
        .catch(() => swalError(t('copyErrTitle'), t('copyErrDesc')));
    }, t('btnCopyCookieTitle'));

    const delCookieBtn = makeBtn(`${ICONS.trash}<span>${esc(t('btnDeleteShort'))}</span>`, 'btn btn-soft-danger btn-xs', async () => {
      const result = await swalConfirm(t('delCookieTitle', c.name), t('delCookieBody'), t('delCookieConfirm'), 'danger');
      if (!result.isConfirmed) return;
      const res = await sendBg({ action: 'deleteCookie', cookieName: c.name, url: activeTab.url });
      if (res && res.success) {
        swalSuccess(t('delSuccessTitle'), `"${c.name}"`);
        loadLive();
      } else {
        swalError(t('delCookieErr'), res?.error || '');
      }
    });

    actDiv.appendChild(copyBtn);
    actDiv.appendChild(delCookieBtn);
    foot.appendChild(badges);
    foot.appendChild(actDiv);

    item.appendChild(hdr);
    item.appendChild(valEl);
    item.appendChild(foot);
    list.appendChild(item);
  });
}

function mkBadge(parent, text, cls) {
  const b = document.createElement('span');
  b.className = 'badge ' + cls;
  b.textContent = text;
  parent.appendChild(b);
}

$('btn-logout').addEventListener('click', async () => {
  if (!activeTab || !activeTab.isSupportedSite) {
    swalError(t('logoutCantTitle'), t('logoutHttpOnlyDesc'));
    return;
  }

  const res = await sendBg({ action: 'getCookiesForUrl', url: activeTab.url });
  if (!res || !res.success || !res.cookies.length) {
    swalWarn(t('errNoCookiesTitle'), t('logoutNoCookiesDesc'));
    return;
  }

  const confirm = await swalConfirm(
    t('logoutConfirmTitle', activeTab.hostname),
    t('logoutConfirmBody', res.cookies.length),
    t('logoutConfirmBtn'),
    'danger'
  );
  if (!confirm.isConfirmed) return;

  const r = await sendBg({ action: 'logoutCookies', cookies: res.cookies });
  if (r && r.success) {
    await clearActiveCookieSession(activeTab.origin);
    await swalSuccess(t('logoutSuccessTitle'), t('logoutSuccessDesc', r.expired));
    if (activeTab.tabId) {
      chrome.tabs.reload(activeTab.tabId, {}, () => void chrome.runtime.lastError);
    }
    loadSaved();
    refreshLiveCountBadge();
  } else {
    swalError(t('logoutErrTitle'), r && r.error);
  }
});

$('live-search').addEventListener('input', applyLiveSearch);
$('live-search-clear').addEventListener('click', () => {
  $('live-search').value = '';
  applyLiveSearch();
  $('live-search').focus();
});
$('btn-copy-all-live').addEventListener('click', () => {
  if (!liveCookies.length) {
    swalWarn(t('errNoCookiesTitle'), t('logoutNoCookiesDesc'));
    return;
  }
  copySnap(liveCookies, $('btn-copy-all-live'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: LOCAL BACKUP & RESTORE (.bak)
// ═══════════════════════════════════════════════════════════════════════════════
const BAK_MAGIC = 'CMBAK1';

function initBackup() {
  refreshBackupStats();
}

async function refreshBackupStats() {
  $('bstat-snaps').textContent = '…';
  $('bstat-sites').textContent = '…';
  $('bstat-cookies').textContent = '…';

  const res = await sendBg({ action: 'getAllCookies' });
  if (!res || !res.success) {
    $('bstat-cookies').textContent = '!';
    $('bstat-sites').textContent = '!';
  } else {
    const cookies = res.cookies || [];
    const sites = new Set(cookies.map(c => c.domain.replace(/^\./, ''))).size;
    $('bstat-cookies').textContent = String(cookies.length);
    $('bstat-sites').textContent = String(sites);
  }

  const r2 = await chrome.storage.local.get('snapshots');
  $('bstat-snaps').textContent = String(Object.keys((r2 && r2.snapshots) || {}).length);
}

async function buildBackupPayload() {
  const cookieRes = await sendBg({ action: 'getAllCookies' });
  if (!cookieRes || !cookieRes.success) {
    throw new Error(cookieRes?.error || t('collectErrTitle'));
  }

  const allCookies = cookieRes.cookies || [];
  const byDomain = {};
  for (const c of allCookies) {
    const d = c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
    if (!byDomain[d]) byDomain[d] = [];
    byDomain[d].push(c);
  }

  const snapRes = await chrome.storage.local.get('snapshots');
  const snapshots = Object.values((snapRes && snapRes.snapshots) || {});

  return {
    magic: BAK_MAGIC,
    version: 3,
    exportedAt: new Date().toISOString(),
    encrypted: false,
    browserCookies: allCookies,
    browserCookieCount: allCookies.length,
    domainCount: Object.keys(byDomain).length,
    snapshots
  };
}

$('btn-toggle-bak-pw').addEventListener('click', () => {
  const inp = $('bak-export-password');
  const btnEl = $('btn-toggle-bak-pw');
  const isHidden = inp.type === 'password';
  inp.type = isHidden ? 'text' : 'password';
  btnEl.innerHTML = isHidden ? ICONS.eyeOff : ICONS.eye;
});

$('btn-do-export-file').addEventListener('click', doExportFile);

async function doExportFile() {
  const prog = $('bak-export-progress');
  const bar = $('bak-export-bar');
  prog.style.display = 'block';
  bar.style.width = '20%';

  let payload;
  try {
    payload = await buildBackupPayload();
  } catch (e) {
    prog.style.display = 'none';
    swalError(t('collectErrTitle'), e.message);
    return;
  }

  if (!payload.browserCookies.length && !payload.snapshots.length) {
    prog.style.display = 'none';
    swalWarn(t('emptyBackupWarnTitle'), t('emptyBackupWarnDesc'));
    return;
  }

  bar.style.width = '55%';
  const passphrase = $('bak-export-password').value;

  let fileContent;
  if (passphrase) {
    payload.encrypted = true;
    const cipher = CryptoJS.AES.encrypt(JSON.stringify(payload), passphrase).toString();
    fileContent = JSON.stringify({
      magic: BAK_MAGIC,
      version: 2,
      encrypted: true,
      exportedAt: payload.exportedAt,
      data: cipher
    });
  } else {
    fileContent = JSON.stringify(payload, null, 2);
  }

  bar.style.width = '85%';

  const rawName = $('bak-backup-name').value.trim();
  const safeBase = (rawName || `cookie-backup-${new Date().toISOString().slice(0, 10)}`)
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  const fname = safeBase.toLowerCase().endsWith('.bak') ? safeBase : `${safeBase}.bak`;

  const blob = new Blob([fileContent], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  bar.style.width = '100%';
  setTimeout(() => {
    prog.style.display = 'none';
    bar.style.width = '0%';
  }, 700);

  showToast(
    'success',
    t('exportedBakTitle', fname),
    t('exportedBakDesc', payload.browserCookieCount, payload.snapshots.length, Boolean(passphrase))
  );
}

// ── Restore from local .bak / .json file ─────────────────────────────────────
const dropZone = $('backup-drop-zone');
dropZone.addEventListener('click', () => $('backup-restore-file').click());
dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    $('backup-restore-file').click();
  }
});
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) doImportBackup(f);
});

$('backup-restore-file').addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) doImportBackup(f);
  e.target.value = '';
});

async function doImportBackup(file) {
  const prog = $('bak-import-progress');
  const bar = $('bak-import-bar');
  prog.style.display = 'block';
  bar.style.width = '15%';

  let raw;
  try { raw = await file.text(); }
  catch (e) { prog.style.display = 'none'; swalError(t('readFileErrTitle'), e.message); return; }

  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { prog.style.display = 'none'; swalError(t('invalidJsonTypeTitle'), t('notJsonDesc')); return; }

  if (!parsed || parsed.magic !== BAK_MAGIC) {
    prog.style.display = 'none';
    swalError(t('wrongMagicTitle'), t('wrongMagicDesc'));
    return;
  }

  bar.style.width = '35%';
  let payload = parsed;

  if (parsed.encrypted) {
    prog.style.display = 'none';
    const dlg = await openAppDialog({
      tone: 'warn',
      icon: ICONS.lock,
      title: t('decryptTitle'),
      subtitle: t('decryptSub'),
      showCancel: true,
      confirmText: t('decryptBtn'),
      cancelText: t('cancelBtn'),
      input: {
        label: t('decryptLabel'),
        type: 'password',
        placeholder: t('decryptPlaceholder'),
        validate: val => !val ? t('decryptValidate') : ''
      }
    });
    if (!dlg.confirmed) return;

    prog.style.display = 'block';
    bar.style.width = '50%';
    try {
      const bytes = CryptoJS.AES.decrypt(parsed.data, dlg.value);
      const plain = bytes.toString(CryptoJS.enc.Utf8);
      if (!plain) throw new Error('empty');
      payload = JSON.parse(plain);
    } catch {
      prog.style.display = 'none';
      swalError(t('wrongPwTitle'), t('wrongPwDesc'));
      return;
    }
  }

  bar.style.width = '65%';
  await applyBackupPayload(payload, payload.exportedAt || parsed.exportedAt);
  bar.style.width = '100%';
  setTimeout(() => {
    prog.style.display = 'none';
    bar.style.width = '0%';
  }, 700);
}

// ── Restore Confirm Modal ─────────────────────────────────────────────────────
function showRestoreConfirmModal({ savedAt, hasBrowserCookies, cookieCount, domainCount, hasSnapshots, snapCount }) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const dateStr = savedAt ? new Date(savedAt).toLocaleString(dateLocale()) : t('unknownDate');

    modal.innerHTML = `
      <div class="modal-hdr">
        <div class="modal-ico accent" aria-hidden="true">${ICONS.restore}</div>
        <div>
          <h3>${esc(t('restoreConfirmTitle'))}</h3>
          <p class="modal-sub">${esc(t('restoreConfirmSub'))}</p>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:8px;background:var(--neutral-soft);border:1px solid var(--border);font-size:12px">
          <span style="color:var(--text-secondary)">${esc(t('restoreDateLabel'))}</span>
          <strong style="color:var(--text);font-size:11px">${esc(dateStr)}</strong>
        </div>
        ${hasBrowserCookies ? `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:8px;background:var(--success-soft);border:1px solid var(--success-border);color:var(--success);font-size:12px">
          <span>${esc(t('restoreCookiesLabel'))}</span>
          <strong>${esc(t('restoreCookiesVal', cookieCount, domainCount))}</strong>
        </div>` : ''}
        ${hasSnapshots ? `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:8px;background:var(--info-soft);border:1px solid var(--info-border);color:var(--info);font-size:12px">
          <span>${esc(t('restoreSnapsLabel'))}</span>
          <strong>${esc(t('restoreSnapsVal', snapCount))}</strong>
        </div>` : ''}
        <div style="display:flex;align-items:flex-start;gap:7px;padding:8px 10px;border-radius:8px;background:var(--warn-soft);border:1px solid var(--warn-border);color:var(--warn);font-size:11px">
          <span aria-hidden="true">${ICONS.alertTriangle}</span>
          <span>${esc(t('restoreWarn'))}</span>
        </div>
      </div>
      <div class="mactions">
        <button type="button" class="btn btn-neutral" id="rcm-cancel">${esc(t('cancelBtn'))}</button>
        <button type="button" class="btn btn-primary" id="rcm-ok">${esc(t('restoreNowBtn'))}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = val => { overlay.remove(); resolve(val); };
    modal.querySelector('#rcm-cancel').addEventListener('click', () => close(false));
    modal.querySelector('#rcm-ok').addEventListener('click', () => close(true));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
  });
}

async function applyBackupPayload(payload, savedAt) {
  const { snapshots: newSnaps = [], browserCookies = [], domainCount = 0 } = payload;
  const hasBrowserCookies = browserCookies.length > 0;
  const hasSnapshots = newSnaps.length > 0;

  if (!hasBrowserCookies && !hasSnapshots) {
    swalWarn(t('emptyFileTitle'), t('emptyFileDesc'));
    return;
  }

  const confirmed = await showRestoreConfirmModal({
    savedAt,
    hasBrowserCookies,
    cookieCount: browserCookies.length,
    domainCount,
    hasSnapshots,
    snapCount: newSnaps.length
  });
  if (!confirmed) return;

  let restoredCookies = 0;
  let failedCookies = 0;
  let restoreFailures = [];

  if (hasBrowserCookies) {
    const r2 = await sendBg({ action: 'restoreCookies', cookies: browserCookies });
    if (!r2 || !r2.success) {
      swalError(t('restoreCookieErr'), r2?.error || t('errUnknown'));
      return;
    }
    restoredCookies = r2.restored || 0;
    failedCookies = r2.failed || 0;
    restoreFailures = Array.isArray(r2.failures) ? r2.failures : [];
  }

  let addedSnaps = 0;
  let overwrittenSnaps = 0;
  if (hasSnapshots) {
    const existRes = await chrome.storage.local.get('snapshots');
    const merged = { ...((existRes && existRes.snapshots) || {}) };
    for (const s of newSnaps) {
      if (!s || !s.origin) continue;
      const key = s.key || (s.origin + '::' + s.label);
      if (merged[key]) overwrittenSnaps++;
      else addedSnaps++;
      merged[key] = { ...s, key, restoredAt: new Date().toISOString() };
    }
    await chrome.storage.local.set({ snapshots: merged });
  }

  refreshBackupStats();
  refreshLiveCountBadge();

  let msg = '';
  if (hasBrowserCookies) msg += t('restorePartialDesc', restoredCookies, failedCookies);
  if (restoreFailures.length) {
    const sample = restoreFailures.slice(0, 4).map(f =>
      `• ${f.name} @ ${f.domain}${f.path}: ${f.error}`
    ).join('\n');
    msg += `\n\n${t('restoreDetailHeader', restoreFailures.length, failedCookies > restoreFailures.length)}\n${sample}`;
  }
  if (hasSnapshots) msg += (msg ? '\n' : '') + t('restoreSummarySnaps', addedSnaps, overwrittenSnaps);

  showToast(
    failedCookies ? 'warning' : 'success',
    failedCookies ? t('restorePartialTitle') : t('restoreDoneTitle'),
    msg
  );

  if (hasSnapshots) {
    setTimeout(() => switchToTab('saved'), 1200);
  }
}
