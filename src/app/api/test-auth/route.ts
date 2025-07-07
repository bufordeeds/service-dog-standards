import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { verifyPassword } from "~/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      status: "success",
      message: "Authentication system is working",
      authenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        profileComplete: session.user.profileComplete,
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({
      status: "error",
      message: "Authentication test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({
        status: "error",
        message: "Email and password required",
      }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true, agreements: true }
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json({
        status: "error",
        message: "Invalid credentials",
      }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.hashedPassword);

    if (!isValid) {
      return NextResponse.json({
        status: "error",
        message: "Invalid credentials",
      }, { status: 401 });
    }

    return NextResponse.json({
      status: "success",
      message: "Authentication successful",
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        role: user.role,
        organizationId: user.organizationId,
        profileComplete: user.profileComplete,
        emailVerified: !!user.emailVerified,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({
      status: "error",
      message: "Authentication test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}