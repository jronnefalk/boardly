import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const session = getKindeServerSession();
        const isAuthenticated = await session.isAuthenticated();
        const user = isAuthenticated ? await session.getUser() : null;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { workspaceId, email } = await request.json();
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { users: true },
        });

        if (!workspace || workspace.createdBy !== user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Check if user is already part of the workspace
        const existingUserWorkspace = await prisma.userWorkspace.findFirst({
            where: {
                workspaceId,
                user: {
                    email,
                },
            },
        });

        if (existingUserWorkspace) {
            return NextResponse.json({ error: "User already part of the workspace" }, { status: 400 });
        }

        // Create user workspace
        await prisma.userWorkspace.create({
            data: {
                user: {
                    connectOrCreate: {
                        where: { email },
                        create: {
                            email,
                            firstName: "", // Adjust as per your needs
                            lastName: "",  // Adjust as per your needs
                        },
                    },
                },
                workspace: {
                    connect: { id: workspaceId },
                },
            },
        });

        return NextResponse.json({ message: "User added to the workspace" }, { status: 200 });
    } catch (error: any) {
        console.error("Error adding user to the workspace:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
