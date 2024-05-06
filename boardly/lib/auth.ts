import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CustomUser = KindeUser & {
    id: string;
    workspaces?: { id: string; name: string }[];
};

export async function getUserInfo(): Promise<{ isAuthenticated: boolean; user: CustomUser | null }> {
    const session = getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();
    const user = isAuthenticated ? await session.getUser() : null;

    if (user) {
        const email = user.email ?? "";
        const given_name = user.given_name ?? "";
        const family_name = user.family_name ?? "";

        await prisma.user.upsert({
            where: { email },
            update: {
                firstName: given_name,
                lastName: family_name,
            },
            create: {
                email,
                firstName: given_name,
                lastName: family_name,
            },
        });

        const userData = await prisma.user.findUnique({
            where: { email },
            include: {
                workspaces: {
                    include: {
                        workspace: true,
                    },
                },
            },
        });

        user.workspaces = userData?.workspaces.map((uw) => uw.workspace) || [];
    }

    return { isAuthenticated, user };
}
