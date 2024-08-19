import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { workspaceId: string } }) {
  try {
    const { workspaceId } = params;

    // Fetch activities directly linked to the workspace
    const activities = await prisma.activity.findMany({
      where: {
        workspaceId,  // Directly filter by workspaceId
      },
      include: {
        user: true,  // Ensure we include the user details
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Fetched activities in backend:", activities);

    return NextResponse.json(activities, { status: 200 });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
