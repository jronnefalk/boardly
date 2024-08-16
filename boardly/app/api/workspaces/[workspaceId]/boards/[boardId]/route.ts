import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET(request: Request, { params }: { params: { boardId: string } }) {
    try {
        const { boardId } = params;

        const board = await prisma.board.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return NextResponse.json({ error: "Board not found" }, { status: 404 });
        }

        return NextResponse.json({ board }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching board:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { boardId: string } }) {
    try {
        const { boardId } = params;
        const { title } = await request.json();

        if (!title) {
            return NextResponse.json({ error: "Board title is required" }, { status: 400 });
        }

        const updatedBoard = await prisma.board.update({
            where: { id: boardId },
            data: { title },
        });

        return NextResponse.json({ board: updatedBoard }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating board:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { boardId: string } }) {
    try {
        const { boardId } = params;

        await prisma.board.delete({
            where: { id: boardId },
        });

        return NextResponse.json({ message: "Board deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting board:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
