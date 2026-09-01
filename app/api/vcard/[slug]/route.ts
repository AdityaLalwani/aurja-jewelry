import { getProfile, site } from "@/lib/site";

/**
 * GET /api/vcard/[slug] — serves a vCard (.vcf) so the browser's
 * native "add to contacts" flow works reliably on iOS and Android.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const profile = getProfile(slug);
  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  const [firstName, ...rest] = profile.name.split(" ");
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${rest.join(" ")};${firstName};;;`,
    `FN:${profile.name}`,
    `ORG:${profile.company}`,
    `TITLE:${profile.designation}`,
    `TEL;TYPE=CELL:${profile.phoneDisplay.replace(/\s+/g, "")}`,
    `EMAIL;TYPE=INTERNET:${profile.email}`,
    `URL:${site.url}`,
    `ADR;TYPE=WORK:;;${profile.location};;;;`,
    "END:VCARD",
  ].join("\r\n");

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${profile.slug}.vcf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
