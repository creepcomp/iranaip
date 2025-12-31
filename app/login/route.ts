import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_SECRET = process.env.ADMIN_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing magic link token" }, { status: 400 });
    }

    if (token !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Invalid magic link" }, { status: 401 });
    }

    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const jwt = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secretKey);

    const cookieStore = await cookies();
    cookieStore.set("session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.redirect(new URL("/admin", req.url));
  } catch (err) {
    console.error("Magic link login failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
