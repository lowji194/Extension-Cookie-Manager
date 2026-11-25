'use strict';

chrome.runtime.onInstalled.addListener(() => {
  // Chuyển trạng thái "đang load" từ khóa autosave cũ và dọn khóa cấu hình cloud cũ nếu có.
  chrome.storage.local.get(null).then(async all => {
    const legacyAutosaveKeys = Object.keys(all).filter(key => key.startsWith('autosave::'));
    const keysToRemove = [...legacyAutosaveKeys];

    if (Object.prototype.hasOwnProperty.call(all, 'cloudApiUrl')) keysToRemove.push('cloudApiUrl');
    if (Object.prototype.hasOwnProperty.call(all, 'cloudAutoKey')) keysToRemove.push('cloudAutoKey');
    if (Object.prototype.hasOwnProperty.call(all, 'timers')) keysToRemove.push('timers');

    if (legacyAutosaveKeys.length) {
      const activeCookieSessions = { ...(all.activeCookieSessions || {}) };
      for (const key of legacyAutosaveKeys) {
        const legacy = all[key];
        const origin = key.slice('autosave::'.length);
        if (legacy && legacy.name) {
          activeCookieSessions[normalizeCookieSite(origin)] = String(legacy.name);
        }
      }
      await chrome.storage.local.set({ activeCookieSessions });
    }

    if (keysToRemove.length) {
      await chrome.storage.local.remove(keysToRemove);
    }
  }).catch(() => {});
});

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (!req || !req.action) return false;

  if (req.action === 'getActiveTab')            { getActiveTab(sendResponse);                              return true; }
  if (req.action === 'getAllCookies')           { getAllBackupCookies(sendResponse);                       return true; }
  // Giữ alias cũ để tương thích bản sao lưu trước đây.
  if (req.action === 'getAllPersistentCookies') { getAllBackupCookies(sendResponse);                       return true; }
  if (req.action === 'getCookiesForUrl')        { getCookiesForUrl(req.url, sendResponse);                 return true; }
  if (req.action === 'saveCookies')             { saveCookies(req.label, req.origin, req.cookies, sendResponse); return true; }
  if (req.action === 'getSavedAll')             { getSavedAll(sendResponse);                               return true; }
  if (req.action === 'restoreCookies')          { restoreCookies(req.cookies, sendResponse);               return true; }
  if (req.action === 'deleteSnapshot')          { deleteSnapshot(req.key, sendResponse);                   return true; }
  if (req.action === 'deleteCookie')            { deleteCookieByName(req.cookieName, req.url, sendResponse); return true; }
  if (req.action === 'logoutCookies')           { logoutCookies(req.cookies, sendResponse);                return true; }

  return false;
});

function normalizeCookieSite(value) {
  if (!value) return '';
  try {
    const url = value.includes('://') ? new URL(value) : new URL('https://' + value);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return String(value).toLowerCase().trim().replace(/^www\./, '').split('/')[0];
  }
}

function buildCookieDetails(c, expirationOverride = null) {
  const base = c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
  const path = c.path || '/';
  const scheme = c.secure ? 'https://' : 'http://';
  const det = {
    url: scheme + base + path,
    name: c.name,
    value: c.value,
    path,
    secure: !!c.secure,
    httpOnly: !!c.httpOnly,
    sameSite: c.sameSite || 'unspecified'
  };

  // Host-only và __Host- cookie không được có thuộc tính Domain.
  if (!c.hostOnly && !String(c.name || '').startsWith('__Host-')) {
    det.domain = c.domain;
  }
  if (c.storeId !== undefined && c.storeId !== null) det.storeId = c.storeId;
  if (c.partitionKey) det.partitionKey = c.partitionKey;

  if (expirationOverride !== null) {
    det.expirationDate = expirationOverride;
  } else if (!c.session && c.expirationDate) {
    det.expirationDate = c.expirationDate;
  }

  return det;
}

async function getActiveTab(cb) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      cb({ success: false, error: 'Unable to detect active tab' });
      return;
    }
    const url = new URL(tab.url);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    cb({
      success: true,
      tabId: tab.id,
      url: tab.url,
      origin: isHttp ? url.origin : '',
      hostname: isHttp ? url.hostname : url.protocol.replace(':', ''),
      title: tab.title || '',
      isSupportedSite: isHttp
    });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}

async function getAllBackupCookies(cb) {
  try {
    const all = await chrome.cookies.getAll({});
    const now = Date.now() / 1000;
    // Giữ session cookie vì là một phần trạng thái đăng nhập hiện tại; chỉ loại persistent cookie đã hết hạn.
    const cookies = all.filter(c => c.session || !c.expirationDate || c.expirationDate > now);
    cb({
      success: true,
      cookies,
      total: all.length,
      persistent: cookies.filter(c => !c.session).length,
      session: cookies.filter(c => c.session).length,
      partitioned: cookies.filter(c => !!c.partitionKey).length
    });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}

async function getCookiesForUrl(url, cb) {
  try {
    const cookies = await chrome.cookies.getAll({ url });
    const seen = new Set();
    const unique = cookies.filter(c => {
      const k = `${c.name}|${c.domain}|${c.path || '/'}|${c.partitionKey ? JSON.stringify(c.partitionKey) : ''}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    cb({ success: true, cookies: unique });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}

async function saveCookies(label, origin, cookies, cb) {
  try {
    const res = await chrome.storage.local.get('snapshots');
    const snapshots = res.snapshots || {};
    const key = origin + '::' + label;

    snapshots[key] = {
      key,
      label,
      origin,
      cookies,
      savedAt: new Date().toISOString(),
      count: cookies.length
    };

    await chrome.storage.local.set({ snapshots });
    cb({ success: true, key });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}

async function getSavedAll(cb) {
  try {
    const res = await chrome.storage.local.get('snapshots');
    cb({ success: true, snapshots: res.snapshots || {} });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}

async function restoreCookies(cookies, cb) {
  try {
    let ok = 0;
    let fail = 0;
    const failures = [];

    for (const c of cookies) {
      try {
        const det = buildCookieDetails(c);
        const restored = await chrome.cookies.set(det);
        if (!restored) throw new Error('Browser rejected or omitted cookie');
        ok++;
      } catch (e) {
        fail++;
        if (failures.length < 100) {
          failures.push({
            name: c.name || '',
            domain: c.domain || '',
            path: c.path || '/',
            storeId: c.storeId ?? '',
            partitioned: !!c.partitionKey,
            error: e && e.message ? e.message : String(e)
          });
        }
      }
    }

    cb({ success: true, restored: ok, failed: fail, failures });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}

async function deleteSnapshot(key, cb) {
  try {
    const res = await chrome.storage.local.get('snapshots');
    const snapshots = res.snapshots || {};
    delete snapshots[key];
    await chrome.storage.local.set({ snapshots });
    cb({ success: true });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}

async function deleteCookieByName(name, url, cb) {
  try {
    const cookies = await chrome.cookies.getAll({ url, name });
    for (const c of cookies) {
      const base = c.domain.startsWith('.') ? c.domain.slice(1) : c.domain;
      const scheme = c.secure ? 'https://' : 'http://';
      const details = {
        url: scheme + base + (c.path || '/'),
        name: c.name
      };
      if (c.storeId !== undefined && c.storeId !== null) details.storeId = c.storeId;
      if (c.partitionKey) details.partitionKey = c.partitionKey;
      await chrome.cookies.remove(details);
    }
    cb({ success: true });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}

async function logoutCookies(cookies, cb) {
  try {
    let expired = 0;
    let fail = 0;
    const pastTime = Math.floor(Date.now() / 1000) - 1;

    for (const c of cookies) {
      try {
        const det = buildCookieDetails(c, pastTime);
        await chrome.cookies.set(det);
        expired++;
      } catch {
        fail++;
      }
    }

    cb({ success: true, expired, failed: fail });
  } catch (e) {
    cb({ success: false, error: e.message });
  }
}
