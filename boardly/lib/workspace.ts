import { PrismaClient } from '@prisma/client';
import { getUserInfo } from '@/lib/auth';

const prisma = new PrismaClient();

export async function createWorkspace(workspaceName: string) {
    const { isAuthenticated, user } = await getUserInfo();

    if (!isAuthenticated || !user) {
        throw new Error('User is not authenticated');
    }

    const workspace = await prisma.workspace.create({
        data: {
            name: workspaceName,
            createdBy: user.email!,
            users: {
                create: {
                    user: {
                        connect: { email: user.email },
                    },
                },
            },
        },
    });
    console.log('Workspace created successfully:', workspace);
    return workspace;
}
