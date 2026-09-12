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
