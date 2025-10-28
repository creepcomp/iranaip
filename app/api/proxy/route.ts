import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  const res = await fetch(url);
  const data = await res.arrayBuffer();

  return new NextResponse(data, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/pdf",
    },
  });
}