import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { getUserInfo } from "@/lib/auth";
import { logActivity } from "@/lib/logActivity";

export async function POST(request: Request, { params }: { params: { workspaceId: string } }) {
    try {
        const { title } = await request.json();
        const workspaceId = params.workspaceId;

        if (!title) {
            return NextResponse.json({ error: "Board title is required" }, { status: 400 });
        }

        const { isAuthenticated, user } = await getUserInfo();

        if (!isAuthenticated || !user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const workspaceUser = await prisma.userWorkspace.findFirst({
            where: {
                workspaceId,
                userId: dbUser.id,  
            },
        });

        if (!workspaceUser || workspaceUser.role !== 'ADMIN') {
            return NextResponse.json({ error: "You don't have permission to create a board in this workspace" }, { status: 403 });
        }

        const newBoard = await prisma.board.create({
            data: {
                title,
                workspaceId,
            },
        });

        await logActivity("created board", `created board "${title}"`, newBoard.id);

        return NextResponse.json({ board: newBoard }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating board:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: { workspaceId: string } }) {
    try {
        const { workspaceId } = params;

        if (!workspaceId) {
            return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
        }

        const boards = await prisma.board.findMany({
            where: { workspaceId },
        });

        return NextResponse.json({ boards }, { status: 200 });
    } catch (error) {
        console.error("Error fetching boards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { boardId } = await request.json();

        if (!boardId) {
            return NextResponse.json({ error: "Board ID is required" }, { status: 400 });
        }

        console.log("Deleting board with ID:", boardId);

        await prisma.board.delete({
            where: { id: boardId },
        });

        return NextResponse.json({ message: "Board deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting board:", error.message);
        console.error("Full error details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}