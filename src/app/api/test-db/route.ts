import { NextResponse } from "next/server";
import { prisma } from "~/server/db";

export async function GET() {
  try {
    // Test database connection by counting users
    const userCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    
    return NextResponse.json({ 
      status: "success", 
      userCount,
      orgCount,
      message: "Database connected successfully! PostgreSQL is working with Vercel Postgres.",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}