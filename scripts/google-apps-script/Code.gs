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

    if (body.type === "order-enquiry") {
      try {
        return handleOrderEnquiry(body);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Order enquiry processing failed", error);
        return jsonResponse({
          ok: false,
          error: "Order enquiry processing failed: " + message.slice(0, 300)
        }, 500);
      }
    }
    if (body.type === "product-enquiry") {
      try {
        return handleProductEnquiry(body);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Product enquiry processing failed", error);
        return jsonResponse({
          ok: false,
          error: "Product enquiry processing failed: " + message.slice(0, 300)
        }, 500);
      }
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
    console.error("Webhook request failed", error);
    return jsonResponse({ ok: false, error: "Unable to process request" }, 500);
  } finally {
    lock.releaseLock();
  }
}

function handleOrderEnquiry(body) {
  const salesEmailSetting = PropertiesService.getScriptProperties().getProperty("AURJA_SALES_EMAIL") || "";
  const salesEmails = salesEmailSetting.split(/[;,]/).map(function (email) {
    return email.trim();
  });
  const requestId = String(body.requestId || "").trim();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const address = body.shippingAddress || {};
  const address1 = String(address.address1 || "").trim();
  const address2 = String(address.address2 || "").trim();
  const city = String(address.city || "").trim();
  const state = String(address.state || "").trim();
  const postalCode = String(address.zip || "").trim();
  const country = String(address.country || "").trim();
  const notes = String(body.customizationNotes || "").trim();
  const currency = String(body.currency || "").trim();
  const total = Number(body.total);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
    return jsonResponse({ ok: false, error: "Invalid request ID" }, 400);
  }
  if (!name || name.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      !/^\+[0-9\s().-]+$/.test(phone) ||
      phone.replace(/\D/g, "").length < 8 ||
      phone.replace(/\D/g, "").length > 15) {
    return jsonResponse({ ok: false, error: "Invalid contact details" }, 400);
  }
  if (!address1 || address1.length > 200 || address2.length > 200 ||
      !city || city.length > 100 ||
      !state || state.length > 100 ||
      !postalCode || postalCode.length > 20 ||
      !country || country.length > 100 ||
      notes.length > 2000) {
    return jsonResponse({ ok: false, error: "Invalid order details" }, 400);
  }
  if (!["INR", "USD"].includes(currency) ||
      !Number.isFinite(total) || total < 0 ||
      items.length === 0 || items.length > 100) {
    return jsonResponse({ ok: false, error: "Invalid cart details" }, 400);
  }
  if (!salesEmailSetting.trim() || salesEmails.some(function (email) {
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254;
  })) {
    throw new Error(
      "Missing or invalid AURJA_SALES_EMAIL; enter valid addresses separated by commas or semicolons"
    );
  }
  items.forEach(function (item) {
    if (!item || typeof item.name !== "string" || !item.name ||
        item.name.length > 200 ||
        !Number.isInteger(item.quantity) || item.quantity < 1 ||
        item.quantity > 99 ||
        !Number.isFinite(Number(item.unitPrice)) || Number(item.unitPrice) < 0 ||
        !Number.isFinite(Number(item.lineTotal)) || Number(item.lineTotal) < 0 ||
        !Array.isArray(item.specifications) ||
        item.specifications.length > 20 ||
        item.specifications.some(function (detail) {
          return typeof detail !== "string" || detail.length > 200;
        })) {
      throw new Error("Invalid item in order enquiry");
    }
  });

  const sheet = getOrderEnquiriesSheet();
  const rows = sheet.getDataRange().getValues();
  let rowNumber = rows.findIndex(function (row, index) {
    return index > 0 && String(row[2] || "") === requestId;
  }) + 1;
  const duplicateRequest = rowNumber !== 0;

  if (rowNumber === 0) {
    sheet.appendRow([
      new Date(),
      "Pending Enquiry",
      requestId,
      safeSheetText(name),
      safeSheetText(email),
      safeSheetText(phone),
      safeSheetText([address1, address2].filter(Boolean).join(", ")),
      safeSheetText(city),
      safeSheetText(state),
      safeSheetText(postalCode),
      safeSheetText(country),
      safeSheetText(notes),
      currency,
      total,
      JSON.stringify(items),
      "Pending",
      "Pending"
    ]);
    rowNumber = sheet.getLastRow();
  }

  const itemSummary = items.map(function (item) {
    const variant = item.variantId ? " [variant " + item.variantId + "]" : "";
    const specifications = item.specifications.length
      ? " — " + item.specifications.join(", ")
      : "";
    return "- " + item.name + variant + specifications + " x " + item.quantity +
      " (" + currency + " " + item.lineTotal + ")";
  }).join("\n");
  const addressSummary = [address1, address2, city, state, postalCode, country]
    .filter(Boolean)
    .join(", ");
  const customerSubject = "We received your Aurja order request";
  const customerBody =
    "Dear " + name + ",\n\n" +
    "Thank you for your interest in Aurja. We have received your order request:\n\n" +
    itemSummary + "\n\n" +
    "Our atelier specialist will reach out within 24 hours to discuss your piece, " +
    "availability, and production timeline. No payment is due with this request.\n\n" +
    "With care,\nAurja Atelier";

  if (String(sheet.getRange(rowNumber, 16).getValue()) !== "Sent") {
    try {
      MailApp.sendEmail({
        to: email,
        subject: customerSubject,
        body: customerBody,
        name: "Aurja Atelier"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error("Customer confirmation email failed: " + message);
    }
    sheet.getRange(rowNumber, 16).setValue("Sent");
  }

  if (String(sheet.getRange(rowNumber, 17).getValue()) !== "Sent") {
    const salesBody =
      "New order enquiry — status: Pending Enquiry\n\n" +
      "Request ID: " + requestId + "\n" +
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Phone: " + phone + "\n" +
      "Shipping address: " + addressSummary + "\n\n" +
      "Items:\n" + itemSummary + "\n\n" +
      "Total: " + currency + " " + total + "\n" +
      "Customization notes: " + (notes || "None");
    try {
      MailApp.sendEmail({
        to: salesEmails.join(","),
        subject: "New Aurja order enquiry",
        body: salesBody,
        name: "Aurja Website"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error("Sales notification email failed: " + message);
    }
    sheet.getRange(rowNumber, 17).setValue("Sent");
  }

  return jsonResponse({ ok: true, duplicate: duplicateRequest }, 200);
}

function handleProductEnquiry(body) {
  const salesEmailSetting = PropertiesService.getScriptProperties().getProperty("AURJA_SALES_EMAIL") || "";
  const salesEmails = salesEmailSetting.split(/[;,]/).map(function (email) {
    return email.trim();
  });
  const requestId = String(body.requestId || "").trim();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const product = body.product || {};
  const productName = String(product.name || "").trim();
  const slug = String(product.slug || "").trim();
  const currency = String(product.currency || "").trim();
  const price = Number(product.price);
  const image = String(product.image || "").trim();
  const specifications = Array.isArray(product.specifications)
    ? product.specifications
    : [];

  if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
    return jsonResponse({ ok: false, error: "Invalid request ID" }, 400);
  }
  if (!name || name.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      !/^\+[0-9\s().-]+$/.test(phone) ||
      phone.replace(/\D/g, "").length < 8 ||
      phone.replace(/\D/g, "").length > 15 || phone.length > 24) {
    return jsonResponse({ ok: false, error: "Invalid contact details" }, 400);
  }
  if (!productName || productName.length > 200 ||
      !/^[a-z0-9-]+$/i.test(slug) || slug.length > 200 ||
      !["INR", "USD"].includes(currency) ||
      !Number.isFinite(price) || price < 0 || image.length > 2000 ||
      (image && !/^https:\/\//i.test(image)) ||
      specifications.length > 20 ||
      specifications.some(function (detail) {
        return typeof detail !== "string" || detail.length > 200;
      })) {
    return jsonResponse({ ok: false, error: "Invalid product details" }, 400);
  }
  if (!salesEmailSetting.trim() || salesEmails.some(function (address) {
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || address.length > 254;
  })) {
    throw new Error(
      "Missing or invalid AURJA_SALES_EMAIL; enter valid addresses separated by commas or semicolons"
    );
  }

  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("AURJA_SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Missing spreadsheet ID");
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = "Product Enquiries";
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  const headers = [
    "Created At", "Status", "Request ID", "Full Name", "Email", "Phone",
    "Product Name", "Product Slug", "Price", "Currency", "Product Image",
    "Specifications JSON", "Sales Email"
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);

  const rows = sheet.getDataRange().getValues();
  let rowNumber = rows.findIndex(function (row, index) {
    return index > 0 && String(row[2] || "") === requestId;
  }) + 1;
  const duplicateRequest = rowNumber !== 0;

  if (rowNumber === 0) {
    sheet.appendRow([
      new Date(),
      "Pending Enquiry",
      requestId,
      safeSheetText(name),
      safeSheetText(email),
      safeSheetText(phone),
      safeSheetText(productName),
      safeSheetText(slug),
      price,
      currency,
      safeSheetText(image),
      JSON.stringify(specifications),
      "Pending"
    ]);
    rowNumber = sheet.getLastRow();
  }

  if (String(sheet.getRange(rowNumber, 13).getValue()) !== "Sent") {
    const salesBody =
      "New product enquiry\n\n" +
      "Request ID: " + requestId + "\n" +
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Phone: " + phone + "\n\n" +
      "Product: " + productName + "\n" +
      "Product slug: " + slug + "\n" +
      "Product page path: /products/" + slug + "\n" +
      "Price: " + currency + " " + price + "\n" +
      "Product image: " + (image || "Not available") + "\n" +
      "Specifications: " + (specifications.join(", ") || "Not available");
    try {
      MailApp.sendEmail({
        to: salesEmails.join(","),
        subject: "New Aurja product enquiry",
        body: salesBody,
        name: "Aurja Website"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error("Sales notification email failed: " + message);
    }
    sheet.getRange(rowNumber, 13).setValue("Sent");
  }

  return jsonResponse({ ok: true, duplicate: duplicateRequest }, 200);
}

function authorizeOrderEnquiryEmails() {
  MailApp.getRemainingDailyQuota();
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

function getOrderEnquiriesSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("AURJA_SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Missing spreadsheet ID");

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = "Order Enquiries";
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);

  const headers = [
    "Created At", "Status", "Request ID", "Full Name", "Email", "Phone",
    "Address", "City", "State", "Postal Code", "Country",
    "Customization Notes", "Currency", "Total", "Items JSON",
    "Customer Email", "Sales Email"
  ];
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function safeSheetText(value) {
  const text = String(value || "");
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(payload, status) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
