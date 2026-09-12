const SHEET_NAME = "Subscribers";
const HEADERS = ["Created At", "Source", "Email", "WhatsApp"];

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const expectedSecret = PropertiesService.getScriptProperties().getProperty("AURJA_WEBHOOK_SECRET");
    const body = JSON.parse(event.postData.contents || "{}");

    if (!expectedSecret || body.secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
    }

    const email = String(body.email || "").trim().toLowerCase();
    const whatsapp = String(body.whatsapp || "").trim();
    const source = String(body.source || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return jsonResponse({ ok: false, error: "Invalid email" }, 400);
    }
    if (!["launch", "journal"].includes(source)) {
      return jsonResponse({ ok: false, error: "Invalid source" }, 400);
    }
    if (whatsapp && whatsapp.replace(/\D/g, "").length < 10) {
      return jsonResponse({ ok: false, error: "Invalid WhatsApp number" }, 400);
    }

    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    const normalizedPhone = whatsapp.replace(/\D/g, "");
    const duplicate = rows.slice(1).some(function (row) {
      const rowSource = String(row[1] || "").trim();
      const rowEmail = String(row[2] || "").trim().toLowerCase();
      const rowPhone = String(row[3] || "").replace(/\D/g, "");
      return rowSource === source &&
        (rowEmail === email || (normalizedPhone && rowPhone === normalizedPhone));
    });

    if (duplicate) {
      return jsonResponse({ ok: true, duplicate: true });
    }

    sheet.appendRow([new Date(), source, email, whatsapp]);
    return jsonResponse({ ok: true, duplicate: false });
  } catch (error) {
    return jsonResponse({ ok: false, error: "Unable to save subscription" }, 500);
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("AURJA_SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Missing spreadsheet ID");

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function jsonResponse(payload, status) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
