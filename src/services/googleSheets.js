const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyPhDnqDaVqQbtPP4B4q7C4ceu0xuMuXXzYsCgj__K1fX6zNNJuRGbTuoiZ18zr9RR3lA/exec';

async function requestSheet(payload) {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok || result.ok === false) {
    throw new Error(result.error || 'Gagal sync Google Sheets');
  }

  return result;
}

export async function createJournal(entry) {
  const result = await requestSheet({ action: 'create', entry });
  return {
    ...result,
    syncId: result.id || entry.id,
  };
}

export async function updateJournal(id, entry) {
  const result = await requestSheet({ action: 'update', id, entry });
  return {
    ...result,
    syncId: id,
  };
}

export async function deleteJournal(id) {
  return requestSheet({ action: 'delete', id });
}
