const SHEET_NAME = 'Journals';
const HEADERS = ['id', 'createdAt', 'updatedAt', 'mood', 'body', 'deletedAt', 'title'];

function doGet() {
  return jsonResponse(listEntries_());
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action;

    if (action === 'list') return jsonResponse(listEntries_());
    if (action === 'create') return jsonResponse(createEntry_(payload.entry));
    if (action === 'update') return jsonResponse(updateEntry_(payload.id, payload.entry));
    if (action === 'delete') return jsonResponse(deleteEntry_(payload.id));

    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const isEmpty = firstRow.every((cell) => !cell);
  const isDifferent = HEADERS.some((header, index) => firstRow[index] !== header);

  if (isEmpty || isDifferent) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function listEntries_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return { ok: true, entries: [] };
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const entries = rows
    .map((row) => rowToEntry_(row))
    .filter((entry) => entry.id && !entry.deletedAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { ok: true, entries };
}

function createEntry_(entry) {
  const sheet = getSheet_();
  const normalized = normalizeEntry_(entry);
  const rowIndex = findRowById_(sheet, normalized.id);

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([entryToRow_(normalized)]);
  } else {
    sheet.appendRow(entryToRow_(normalized));
  }

  return { ok: true, id: normalized.id };
}

function updateEntry_(id, entry) {
  const sheet = getSheet_();
  const normalized = normalizeEntry_({ ...entry, id });
  const rowIndex = findRowById_(sheet, id);

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([entryToRow_(normalized)]);
  } else {
    sheet.appendRow(entryToRow_(normalized));
  }

  return { ok: true, id: normalized.id };
}

function deleteEntry_(id) {
  const sheet = getSheet_();
  const rowIndex = findRowById_(sheet, id);

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, HEADERS.indexOf('deletedAt') + 1).setValue(new Date().toISOString());
  }

  return { ok: true, id };
}

function findRowById_(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (!id || lastRow < 2) return -1;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const index = ids.findIndex((row) => row[0] === id);
  return index === -1 ? -1 : index + 2;
}

function normalizeEntry_(entry) {
  const now = new Date().toISOString();
  return {
    id: entry.id || Utilities.getUuid(),
    createdAt: entry.createdAt || now,
    updatedAt: entry.updatedAt || entry.createdAt || now,
    mood: entry.mood || '😊',
    body: entry.body || '',
    deletedAt: entry.deletedAt || '',
    title: entry.title || '',
  };
}

function entryToRow_(entry) {
  return HEADERS.map((header) => entry[header] || '');
}

function rowToEntry_(row) {
  return HEADERS.reduce((entry, header, index) => {
    entry[header] = row[index] instanceof Date ? row[index].toISOString() : row[index];
    return entry;
  }, {});
}
