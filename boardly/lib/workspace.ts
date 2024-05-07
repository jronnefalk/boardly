import { PrismaClient } from "@prisma/client";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const prisma = new PrismaClient();

export async function createWorkspaceServer(workspaceName: string) {
    const session = getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();
    const user = isAuthenticated ? await session.getUser() : null;

    if (!user) {
        throw new Error("User is not authenticated");
    }

    if (!workspaceName) {
        throw new Error("Workspace name cannot be empty");
    }

    const workspace = await prisma.workspace.create({
        data: {
            name: workspaceName,
            createdBy: user.email ?? "",
            users: {
                create: {
                    user: {
                        connect: { email: user.email },
                    },
                },
            },
        },
    });

    return workspace;
}
