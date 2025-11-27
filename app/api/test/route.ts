import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "POST works!", timestamp: new Date().toISOString() });
}

export async function GET() {
  return NextResponse.json({ message: "GET works!", timestamp: new Date().toISOString() });
}

