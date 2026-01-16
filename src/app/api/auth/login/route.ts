import { signIn } from "@/lib/auth";
import { NextResponse } from "next/server";
import { AuthError } from "next-auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: "Email atau password salah" },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
