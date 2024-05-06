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
        // Save or update the user in the database
        await prisma.user.upsert({
            where: { email: user.email ?? "" },
            update: {
                firstName: user.given_name ?? "",
                lastName: user.family_name ?? "",
            },
            create: {
                email: user.email ?? "",
                firstName: user.given_name ?? "",
                lastName: user.family_name ?? "",
            },
        });

        // Fetch the user along with their workspaces
        const userData = await prisma.user.findUnique({
            where: { email: user.email ?? "" },
            include: { workspaces: { include: { workspace: true } } },
        });

        user.workspaces = userData?.workspaces.map((uw) => uw.workspace) || [];
    }

    return { isAuthenticated, user };
}
