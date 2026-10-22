# Firebase authentication

Login and signup support Google and six-digit email OTP. After authentication,
the Next.js server verifies the Firebase ID token, finds or creates a matching
Swell customer, and sets the existing Aurja session cookie. Firebase tokens,
OTP codes, and service-account credentials are never sent to Swell or exposed
to the browser.

## Firebase Console setup

1. In Firebase Console > **Authentication** > **Sign-in method**, enable
   **Google** and choose the support email.
2. In **Authentication** > **Settings** > **Authorized domains**, add the
   production hostname and `localhost` for local development.
3. In **Project settings** > **General**, copy the web app's API key, auth
   domain, project ID, and app ID into the matching
   `NEXT_PUBLIC_FIREBASE_*` environment variables.
4. In **Project settings** > **Service accounts**, generate a private key for
   the Firebase Admin SDK. Store the complete JSON securely as the
   server-only `FIREBASE_SERVICE_ACCOUNT_JSON` variable in local development
   and the deployment environment. Never use a `NEXT_PUBLIC_` prefix for it
   or commit it to the repository.
5. Ensure `FIREBASE_SERVICE_ACCOUNT_JSON.project_id` matches
   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
6. Create a Firestore database in the same Firebase project. The server uses
   the Admin SDK to keep OTP challenges private. Deny client access to the
   `emailOtpChallenges` and `emailOtpRateLimits` collections in Firestore
   Security Rules:

   ```text
   match /emailOtpChallenges/{document} {
     allow read, write: if false;
   }
   match /emailOtpRateLimits/{document} {
     allow read, write: if false;
   }
   ```

7. Configure a Resend account and verify the sender domain. Add these
   server-side variables to `.env.local` and the hosting environment:

   ```env
   RESEND_API_KEY=re_...
   AUTH_EMAIL_FROM=Aurja <login@your-verified-domain.example>
   ```

   `AUTH_EMAIL_FROM` must use an address on a domain verified in Resend.
   Keep `RESEND_API_KEY` server-only. Email OTP requests also use the existing
   Cloudflare Turnstile configuration (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
   server-only `TURNSTILE_SECRET_KEY`); make sure the widget allows local and
   production hostnames.

8. In Firestore, enable time-to-live (TTL) on the `expiresAt` field for both
   `emailOtpChallenges` and `emailOtpRateLimits` collections.

The numeric code is a custom OTP flow implemented in Next.js server route
handlers, not a Firebase email-link or Firebase Cloud Function flow. Firebase
Admin issues a custom sign-in token only after the emailed code is verified.
Firebase itself does not send these numeric codes. Email delivery and any
provider charges depend on the configured Resend account.

Set the Firebase, Firebase Admin, Turnstile, Resend, and `SESSION_SECRET`
variables in `.env.local` for local development and in the hosting provider's
environment for deployment. `SESSION_SECRET` must be a strong, random,
server-only value shared by the cart and sign-in cookies. You can generate one
with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Do not commit `.env.local` or expose `SESSION_SECRET` with a `NEXT_PUBLIC_`
prefix. Restart the development server after changing environment variables,
or redeploy the app after changing the hosting environment. The Firebase
Admin SDK requires Node.js 22 or newer; the project now declares that runtime
requirement.

## Sign-in behavior

Both `/login` and `/signup` offer Google and email OTP. OTP codes are generated
with a cryptographically secure random generator, stored only as an HMAC in
Firestore, expire after 10 minutes, and are consumed after one successful
verification. Requests are protected by Turnstile, limited to three sends per
email each hour with a 60-second resend delay, and allow at most five
verification attempts per code. After verification, the server creates or
reuses a verified Firebase user, issues a short-lived custom sign-in token,
and follows the existing Firebase-to-Swell session flow.

On first successful authentication, the server creates a Swell account using
the verified email and any profile name provided by Google. Later
authentications reuse the matching Swell account. Existing Swell profile
details are not overwritten. The profile sign-out action clears both the
Firebase client session and the Aurja session cookie.

If an auth step receives a non-JSON response, the page reports which step
failed and its HTTP status. The browser console also records the response
content type. Use the failing request in the browser Network panel and the
matching deployment/server logs to identify whether the response came from
the app route or an upstream host; response bodies are intentionally not
logged.
