# Google Sheets subscriptions

The subscription writer is in `scripts/google-apps-script/Code.gs`. It uses a script lock to serialize requests and checks the existing rows before appending, so concurrent submissions cannot create duplicate email or WhatsApp entries within the same source. A person may subscribe separately to both the launch updates and the Aurja Journal.

## One-time setup

1. Open the target spreadsheet and set **Share > General access** to **Restricted**. Remove any public or link-sharing access. The sheet ID is already the one supplied for this project.
2. Open [script.google.com](https://script.google.com), create a standalone Apps Script project, and paste in `scripts/google-apps-script/Code.gs`.
3. In **Project Settings > Script Properties**, add:
   - `AURJA_SPREADSHEET_ID`: `1upWyMPelljlQodVfL_Lzg_wXg3hYc0MmVJ_M0qy346Q`
   - `AURJA_WEBHOOK_SECRET`: a long random value
4. Deploy the Apps Script as a **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the web-app URL into the server environment as `GOOGLE_SHEETS_WEBHOOK_URL`.
6. Set `GOOGLE_SHEETS_WEBHOOK_SECRET` to the exact same random value as the script property.
7. Restart or redeploy the Next.js app after setting the environment variables.

The Apps Script endpoint is intentionally public at the network level so the Next.js server can reach it, but it accepts writes only when the private shared secret matches. The spreadsheet itself stays restricted to you, and the secret must never be prefixed with `NEXT_PUBLIC_`.

The `Subscribers` tab is created automatically with these columns:

`Created At | Source | Email | WhatsApp`

## Cart order requests

The cart's **Request to Order** form sends the enquiry to the same Apps Script
webhook. Each request is saved to an `Order Enquiries` tab with a `Pending
Enquiry` status, the customer's contact and shipping details, customization
notes, and a snapshot of the cart items and displayed total. The Apps Script
also sends a confirmation email to the customer and a full request notification
to the sales team. No payment is collected by this workflow.

Add an `AURJA_SALES_EMAIL` script property containing the sales team's
notification addresses, separated by commas or semicolons (for example,
`sales@example.com, atelier@example.com`). In the Apps Script editor, select and run
`authorizeOrderEnquiryEmails` once, then approve the requested mail permission.
This function only requests the remaining mail quota; it does not send a test
email. The Apps Script sends mail as the Google account that owns the
deployment. After updating `scripts/google-apps-script/Code.gs`, create a new
version of the existing web-app deployment so the live webhook uses the
updated code. If a submission still fails, the error identifies whether the
customer confirmation or sales notification failed; the request remains in
the sheet and can be retried after correcting the script configuration.

## Product enquiries

The **Get in Touch** form on product cards collects the customer's name, phone,
and email. The server looks up the product by its catalog slug and sends its
current name, price, image, and available specifications to the same
authenticated Apps Script webhook. Product requests are saved to a
`Product Enquiries` tab and emailed to the addresses in `AURJA_SALES_EMAIL`.
After updating the Apps Script, redeploy a new version of the existing web app
so the product enquiry handler is available.

Keep the spreadsheet restricted to the Aurja team: the order enquiries tab
contains customer contact and delivery information. The webhook authenticates
requests with the same `AURJA_WEBHOOK_SECRET` used for subscriptions.
