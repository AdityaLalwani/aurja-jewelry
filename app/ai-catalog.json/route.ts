import { ardManifest } from "@/lib/ard-manifest";

export function GET() {
  return Response.json(ardManifest);
}
