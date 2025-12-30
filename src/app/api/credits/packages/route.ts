import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Credit packages - these would ideally be in the database
const DEFAULT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    price: 9.99,
    description: "Perfect for trying out the platform",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 200,
    price: 29.99,
    description: "Best value for regular users",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    credits: 500,
    price: 59.99,
    description: "For teams and power users",
  },
];

// GET /api/credits/packages - Get available credit packages
export async function GET() {
  try {
    // Try to get packages from database
    const dbPackages = await prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { credits: "asc" },
    });

    if (dbPackages.length > 0) {
      return NextResponse.json({ packages: dbPackages });
    }

    // Return default packages if none in database
    return NextResponse.json({ packages: DEFAULT_PACKAGES });
  } catch (error) {
    console.error("Get packages error:", error);
    // Return default packages on error
    return NextResponse.json({ packages: DEFAULT_PACKAGES });
  }
}
