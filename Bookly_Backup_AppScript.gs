/**
 * ==============================================================================
 * BOOKLY PRO - GOOGLE APPS SCRIPT BACKUP & 2-WAY LIVE SYNC ENGINE
 * ==============================================================================
 * Version: 4.1.0
 * Developer: Moshiur Rahman (Moshclusive)
 * Description: 
 *   Complete cloud backup and two-way live sync engine for Bookly Pro.
 *   Saves bookmarks, folders, tags, notes, favorites, quick access dock,
 *   To Do list tasks, and full lossless state in Google Sheets.
 * 
 * SETUP INSTRUCTIONS:
 *   1. Create a new Google Spreadsheet and name it "Bookly Pro Backup".
 *   2. Go to: Extensions > Apps Script.
 *   3. Delete any code in Code.gs and paste this entire code.
 *   4. Click "Deploy" > "New deployment".
 *   5. Select type: "Web app".
 *   6. Set "Execute as": "Me".
 *   7. Set "Who has access": "Anyone" (Required for Bookly Pro to communicate).
 *   8. Click "Deploy", authorize access, and copy the "Web app URL".
 *   9. In Bookly Pro, open Settings > Backup & Sync > Paste your Web app URL. Done!
 * ==============================================================================
 */

var TAB_BOOKMARKS = "Bookmarks";
var TAB_FOLDERS = "Folders";
var TAB_QUICK_ACCESS = "Quick Access";
var TAB_RAW_BACKUP = "_raw_snapshot";

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback for url-encoded form post
      }
    }

    var data = Object.assign({}, params, postData);
    var action = (data.action || '').trim().toLowerCase();

    // Browser visit without action -> Render Web Dashboard
    if (!action || action === 'dashboard') {
      return renderDashboard();
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'backup' || action === 'sync_push') {
      return handleBackup(ss, data);
    } else if (action === 'restore' || action === 'get_backup' || action === 'sync_pull') {
      return handleRestore(ss, data);
    } else if (action === 'stats' || action === 'ping') {
      return handleStats(ss);
    } else {
      return jsonResponse({
        success: false,
        code: 'UNKNOWN_ACTION',
        message: 'Action not supported. Available actions: backup, restore, stats, ping.'
      });
    }
  } catch (err) {
    return jsonResponse({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Server error: ' + (err.message || String(err))
    });
  }
}

/**
 * Handle incoming backup payload from Bookly Pro
 */
function handleBackup(ss, data) {
  var now = new Date();
  var timestampIso = now.toISOString();

  var links = (data.links && typeof data.links === 'object') ? data.links : {};
  var folderOrder = Array.isArray(data.folderOrder) ? data.folderOrder : [];
  var pinnedFolders = Array.isArray(data.pinnedFolders) ? data.pinnedFolders : [];
  var favoriteFolders = (data.favoriteFolders && typeof data.favoriteFolders === 'object') ? data.favoriteFolders : {};
  var folderIcons = (data.folderIcons && typeof data.folderIcons === 'object') ? data.folderIcons : {};
  var quickAccess = Array.isArray(data.quickAccess) ? data.quickAccess : [];

  var totalBookmarks = countTotalBookmarks(links);

  // CLOUD PROTECTION: If incoming bookmarks are 0, but sheet already has bookmarks, reject empty push!
  if (totalBookmarks === 0) {
    var existingRaw = readRawBackup(ss);
    if (existingRaw && countTotalBookmarks(existingRaw.links) > 0) {
      return jsonResponse({
        success: false,
        code: 'CLOUD_PROTECTED',
        message: 'Empty backup rejected: Google Sheet already has ' + countTotalBookmarks(existingRaw.links) + ' bookmarks. Sheet protected.'
      });
    }
  }

  // 1. Update Bookmarks Sheet
  var totalBookmarksUpdated = updateBookmarksSheet(ss, links);

  // 2. Update Folders Sheet
  var totalFoldersUpdated = updateFoldersSheet(ss, links, folderOrder, pinnedFolders, favoriteFolders, folderIcons);

  // 3. Update Quick Access Sheet
  updateQuickAccessSheet(ss, quickAccess);

  // 4. Save Full Lossless Raw Snapshot
  var rawPayload = {
    version: data.version || "4.1.0",
    exportDate: timestampIso,
    links: links,
    folderOrder: folderOrder,
    pinnedFolders: pinnedFolders,
    favoriteFolders: favoriteFolders,
    folderIcons: folderIcons,
    quickAccess: quickAccess,
    customLinkOrder: data.customLinkOrder || {},
    theme: data.theme || "dark",
    dailyFocusTasks: data.dailyFocusTasks || [],
    dailyNotes: data.dailyNotes || "",
    todoWindowPosition: data.todoWindowPosition || null
  };
  saveRawBackup(ss, rawPayload);

  return jsonResponse({
    status: 'ok',
    success: true,
    code: 'BACKUP_SUCCESS',
    message: 'Bookly Pro backup successfully saved to Google Sheets!',
    timestamp: timestampIso,
    totalBookmarks: totalBookmarksUpdated,
    totalFolders: totalFoldersUpdated,
    counts: {
      bookmarks: totalBookmarksUpdated,
      folders: totalFoldersUpdated,
      quickAccess: quickAccess.length
    }
  });
}

/**
 * Handle restore request from Bookly Pro
 */
function handleRestore(ss, data) {
  // 1. Try reading lossless raw snapshot first
  var rawData = readRawBackup(ss);
  if (rawData && rawData.links && Object.keys(rawData.links).length > 0) {
    var count = countTotalBookmarks(rawData.links);
    return jsonResponse({
      status: 'ok',
      success: true,
      code: 'RESTORE_SUCCESS',
      source: 'raw_snapshot',
      data: rawData,
      backup: rawData,
      totalBookmarks: count
    });
  }

  // 2. Fallback: Reconstruct from formatted table sheets
  var reconstructed = reconstructFromSheets(ss);
  var reconCount = countTotalBookmarks(reconstructed.links);

  return jsonResponse({
    status: 'ok',
    success: true,
    code: 'RESTORE_SUCCESS',
    source: 'sheets_table',
    data: reconstructed,
    backup: reconstructed,
    totalBookmarks: reconCount
  });
}

/**
 * Handle ping/stats request
 */
function handleStats(ss) {
  var rawData = readRawBackup(ss);
  var totalBookmarks = 0;
  var totalFolders = 0;
  var lastBackupAt = null;

  if (rawData && rawData.links) {
    totalBookmarks = countTotalBookmarks(rawData.links);
    totalFolders = Object.keys(rawData.links).length;
    lastBackupAt = rawData.exportDate || null;
  } else {
    var bookSheet = ss.getSheetByName(TAB_BOOKMARKS);
    if (bookSheet && bookSheet.getLastRow() > 1) {
      totalBookmarks = bookSheet.getLastRow() - 1;
    }
    var foldSheet = ss.getSheetByName(TAB_FOLDERS);
    if (foldSheet && foldSheet.getLastRow() > 1) {
      totalFolders = foldSheet.getLastRow() - 1;
    }
  }

  return jsonResponse({
    status: 'ok',
    success: true,
    code: 'PONG',
    sheetName: ss.getName(),
    totalBookmarks: totalBookmarks,
    totalFolders: totalFolders,
    lastBackupAt: lastBackupAt
  });
}

/**
 * Update Bookmarks table sheet
 */
function updateBookmarksSheet(ss, links) {
  var sheet = getOrCreateSheet(ss, TAB_BOOKMARKS);
  sheet.clearContents();

  var headers = [
    'Folder',
    'Title',
    'URL',
    'Tags',
    'Notes',
    'Favorite',
    'Pinned',
    'Order',
    'ID',
    'Date Added'
  ];

  var rows = [headers];
  var total = 0;

  for (var folderName in links) {
    if (!links.hasOwnProperty(folderName)) continue;
    var list = links[folderName];
    if (!Array.isArray(list)) continue;

    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (!b) continue;
      total++;

      var tagsStr = Array.isArray(b.tags) ? b.tags.join(', ') : (b.tags || '');

      rows.push([
        folderName,
        b.title || '',
        b.link || '',
        tagsStr,
        b.note || b.notes || '',
        b.favorite ? 'Yes' : 'No',
        b.pinned ? 'Yes' : 'No',
        b.order !== undefined ? b.order : (i * 10),
        b.id || '',
        b.dateAdded || ''
      ]);
    }
  }

  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    formatHeaderRow(sheet, headers.length, '#4f46e5');
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);
  }

  return total;
}

/**
 * Update Folders table sheet
 */
function updateFoldersSheet(ss, links, folderOrder, pinnedFolders, favoriteFolders, folderIcons) {
  var sheet = getOrCreateSheet(ss, TAB_FOLDERS);
  sheet.clearContents();

  var headers = [
    'Folder Name',
    'Order Sequence',
    'Total Bookmarks',
    'Pinned',
    'Favorite',
    'Icon / Emoji'
  ];

  var rows = [headers];

  var allFolders = [];
  var seen = {};

  if (Array.isArray(folderOrder)) {
    for (var i = 0; i < folderOrder.length; i++) {
      var f = folderOrder[i];
      if (f && !seen[f]) { seen[f] = true; allFolders.push(f); }
    }
  }

  for (var fName in links) {
    if (links.hasOwnProperty(fName) && !seen[fName]) {
      seen[fName] = true;
      allFolders.push(fName);
    }
  }

  for (var idx = 0; idx < allFolders.length; idx++) {
    var name = allFolders[idx];
    var count = Array.isArray(links[name]) ? links[name].length : 0;
    var isPinned = pinnedFolders.indexOf(name) !== -1;
    var isFav = !!favoriteFolders[name];
    var icon = folderIcons[name] || '';

    rows.push([
      name,
      idx,
      count,
      isPinned ? 'Yes' : 'No',
      isFav ? 'Yes' : 'No',
      icon
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    formatHeaderRow(sheet, headers.length, '#059669');
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);
  }

  return allFolders.length;
}

/**
 * Update Quick Access table sheet
 */
function updateQuickAccessSheet(ss, quickAccess) {
  var sheet = getOrCreateSheet(ss, TAB_QUICK_ACCESS);
  sheet.clearContents();

  var headers = ['Title', 'URL', 'Icon / Favicon', 'Order'];
  var rows = [headers];

  if (Array.isArray(quickAccess)) {
    for (var i = 0; i < quickAccess.length; i++) {
      var item = quickAccess[i];
      if (!item) continue;
      rows.push([
        item.title || '',
        item.url || item.link || '',
        item.icon || '',
        i
      ]);
    }
  }

  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    formatHeaderRow(sheet, headers.length, '#d97706');
    sheet.setFrozenRows(1);
  }
}

/**
 * Save Full Lossless Raw Snapshot
 */
function saveRawBackup(ss, rawPayload) {
  var sheet = getOrCreateSheet(ss, TAB_RAW_BACKUP);
  sheet.clearContents();

  var jsonString = JSON.stringify(rawPayload);
  var chunkSize = 45000;
  var chunks = [];

  for (var i = 0; i < jsonString.length; i += chunkSize) {
    chunks.push([jsonString.substring(i, i + chunkSize)]);
  }

  if (chunks.length > 0) {
    sheet.getRange(1, 1, chunks.length, 1).setValues(chunks);
  }

  try {
    sheet.hideSheet();
  } catch (_) {}
}

/**
 * Read Full Lossless Raw Snapshot
 */
function readRawBackup(ss) {
  var sheet = ss.getSheetByName(TAB_RAW_BACKUP);
  if (!sheet) return null;

  var lastRow = sheet.getLastRow();
  if (lastRow < 1) return null;

  var values = sheet.getRange(1, 1, lastRow, 1).getValues();
  var fullJson = '';
  for (var i = 0; i < values.length; i++) {
    fullJson += String(values[i][0] || '');
  }

  if (!fullJson) return null;

  try {
    return JSON.parse(fullJson);
  } catch (err) {
    return null;
  }
}

/**
 * Reconstruct from sheets
 */
function reconstructFromSheets(ss) {
  var links = {};
  var folderOrder = [];
  var quickAccess = [];

  var bookSheet = ss.getSheetByName(TAB_BOOKMARKS);
  if (bookSheet && bookSheet.getLastRow() > 1) {
    var data = bookSheet.getRange(2, 1, bookSheet.getLastRow() - 1, 10).getValues();
    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      var folder = String(r[0] || 'General').trim() || 'General';
      links[folder] = links[folder] || [];

      var tags = String(r[3] || '').split(',').map(function(t) { return t.trim(); }).filter(Boolean);

      links[folder].push({
        id: String(r[8] || ('b_' + Date.now() + '_' + i)),
        title: String(r[1] || ''),
        link: String(r[2] || ''),
        tags: tags,
        note: String(r[4] || ''),
        favorite: String(r[5]).toLowerCase() === 'yes',
        pinned: String(r[6]).toLowerCase() === 'yes',
        order: Number(r[7]) || (i * 10),
        dateAdded: String(r[9] || new Date().toISOString())
      });
    }
  }

  var foldSheet = ss.getSheetByName(TAB_FOLDERS);
  if (foldSheet && foldSheet.getLastRow() > 1) {
    var foldData = foldSheet.getRange(2, 1, foldSheet.getLastRow() - 1, 2).getValues();
    for (var j = 0; j < foldData.length; j++) {
      var fName = String(foldData[j][0] || '').trim();
      if (fName) folderOrder.push(fName);
    }
  }

  var qaSheet = ss.getSheetByName(TAB_QUICK_ACCESS);
  if (qaSheet && qaSheet.getLastRow() > 1) {
    var qaData = qaSheet.getRange(2, 1, qaSheet.getLastRow() - 1, 4).getValues();
    for (var k = 0; k < qaData.length; k++) {
      var row = qaData[k];
      quickAccess.push({
        title: String(row[0] || ''),
        url: String(row[1] || ''),
        icon: String(row[2] || '')
      });
    }
  }

  return {
    version: "4.1.0",
    exportDate: new Date().toISOString(),
    links: links,
    folderOrder: folderOrder,
    quickAccess: quickAccess
  };
}

function countTotalBookmarks(links) {
  if (!links || typeof links !== 'object') return 0;
  var sum = 0;
  for (var k in links) {
    if (links.hasOwnProperty(k) && Array.isArray(links[k])) {
      sum += links[k].length;
    }
  }
  return sum;
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeaderRow(sheet, numCols, bgColor) {
  try {
    var range = sheet.getRange(1, 1, 1, numCols);
    range.setBackground(bgColor);
    range.setFontColor('#ffffff');
    range.setFontWeight('bold');
    range.setFontFamily('Segoe UI');
    range.setFontSize(10);
  } catch (_) {}
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Render visual Web Dashboard when visiting the Web App URL in a browser
 */
function renderDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var raw = readRawBackup(ss);
  var totalBookmarks = raw && raw.links ? countTotalBookmarks(raw.links) : 0;
  var totalFolders = raw && raw.links ? Object.keys(raw.links).length : 0;
  var lastBackup = raw && raw.exportDate ? new Date(raw.exportDate).toLocaleString() : 'Never';

  var html = 
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<title>Bookly Pro Cloud Hub</title>' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<style>' +
    '  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }' +
    '  body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }' +
    '  .card { max-width: 620px; width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }' +
    '  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #064e3b; color: #34d399; margin-bottom: 16px; }' +
    '  .pulse { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; }' +
    '  h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #fff; }' +
    '  p.sub { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }' +
    '  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }' +
    '  .stat-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; }' +
    '  .stat-val { font-size: 28px; font-weight: 800; color: #6366f1; }' +
    '  .stat-lbl { font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }' +
    '  .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #334155; font-size: 13px; color: #cbd5e1; }' +
    '  .info-lbl { color: #64748b; }' +
    '  .btn { display: block; text-align: center; background: #4f46e5; color: #fff; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 600; margin-top: 24px; }' +
    '  .btn:hover { background: #4338ca; }' +
    '</style></head><body>' +
    '<div class="card">' +
    '  <div class="badge"><div class="pulse"></div> Bookly Pro Cloud Live Sync Active</div>' +
    '  <h1>Bookly Pro Backup Server</h1>' +
    '  <p class="sub">This Google Apps Script Web App connects your Bookly Pro Extension with Google Sheets for instant 2-way sync.</p>' +
    '  <div class="stats-grid">' +
    '    <div class="stat-box"><div class="stat-val">' + totalBookmarks + '</div><div class="stat-lbl">Bookmarks Saved</div></div>' +
    '    <div class="stat-box"><div class="stat-val">' + totalFolders + '</div><div class="stat-lbl">Folders Synced</div></div>' +
    '  </div>' +
    '  <div class="info-row"><span class="info-lbl">Spreadsheet:</span><span>' + ss.getName() + '</span></div>' +
    '  <div class="info-row"><span class="info-lbl">Last Cloud Sync:</span><span>' + lastBackup + '</span></div>' +
    '  <div class="info-row"><span class="info-lbl">Status:</span><span style="color:#10b981;font-weight:600;">Ready &amp; Connected</span></div>' +
    '  <a class="btn" href="' + ss.getUrl() + '" target="_blank">Open Connected Google Sheet &#8599;</a>' +
    '</div></body></html>';

  return HtmlService.createHtmlOutput(html)
    .setTitle('Bookly Pro Cloud Hub')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

