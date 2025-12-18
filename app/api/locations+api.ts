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

    // Debug headers
    console.log("API Headers:", {
      cookie: request.headers.get("cookie"),
      origin: request.headers.get("origin"),
    });

    // Get authenticated session dengan Better Auth
    // SESUAI DOCS: auth.api.getSession menerima cookies dari headers
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    console.log("Session in API:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Unauthorized - Please sign in to save locations",
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
    // Debug headers untuk GET request
    console.log("GET API Headers:", {
      cookie: request.headers.get("cookie"),
      origin: request.headers.get("origin"),
    });

    // Get authenticated session dengan cookies dari headers
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    console.log("GET Session in API:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      return Response.json(
        {
          error: "Unauthorized - Please sign in to view locations",
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

// Tambahkan setelah fungsi GET

export async function DELETE(request: Request) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
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

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("id");

    if (!locationId) {
      return Response.json(
        {
          error: "Location ID is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if location belongs to user
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        userId: session.user.id,
      },
    });

    if (!location) {
      return Response.json(
        {
          error: "Location not found or unauthorized",
          success: false,
        },
        { status: 404 }
      );
    }

    // If deleting default location, set another as default
    if (location.isDefault) {
      const nextLocation = await prisma.location.findFirst({
        where: {
          userId: session.user.id,
          NOT: { id: locationId },
        },
        orderBy: { createdAt: "desc" },
      });

      if (nextLocation) {
        await prisma.location.update({
          where: { id: nextLocation.id },
          data: { isDefault: true },
        });
      }
    }

    // Delete the location
    await prisma.location.delete({
      where: { id: locationId },
    });

    return Response.json(
      {
        success: true,
        message: "Location deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting location:", error);
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
