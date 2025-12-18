import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, latitude, longitude, label, isDefault } = body;

    // Validate required fields
    if (!address || latitude === undefined || longitude === undefined) {
      return Response.json(
        {
          error: "Missing required fields: address, latitude, longitude",
          success: false,
        },
        { status: 400 }
      );
    }

    // Get authenticated session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // If setting as default, unset other default locations
    if (isDefault) {
      await prisma.location.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create new location
    const location = await prisma.location.create({
      data: {
        userId,
        address,
        latitude,
        longitude,
        label: label || "Default",
        isDefault: isDefault || false,
      },
      select: {
        id: true,
        address: true,
        latitude: true,
        longitude: true,
        label: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Location saved successfully",
        data: location,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving location:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const locations = await prisma.location.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        address: true,
        latitude: true,
        longitude: true,
        label: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        data: locations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
