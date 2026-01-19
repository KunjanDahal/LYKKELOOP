import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    // File lives at the project root: LYKKELOOP-master/Lykeloop QR.jpeg
    const qrPath = path.join(process.cwd(), "Lykeloop QR.jpeg");
    const buf = await readFile(qrPath);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        // Cache in browser for a day; CDN can revalidate quickly
        "Cache-Control": "public, max-age=86400, s-maxage=3600",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "QR not found" }, { status: 404 });
  }
}

