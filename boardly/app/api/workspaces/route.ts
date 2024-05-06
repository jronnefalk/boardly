import { NextResponse } from "next/server";
import { createWorkspaceServer } from "@/lib/workspace";

export async function POST(request: Request) {
    const { workspaceName } = await request.json();
    try {
        const workspace = await createWorkspaceServer(workspaceName);
        return NextResponse.json(workspace);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
