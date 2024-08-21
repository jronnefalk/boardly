import Navbar from "@/components/navbar";
import Sidebar from "@/components/Sidebar";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

const textFont = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated(); 
    const user = isAuthenticated ? await session.getUser() : null;

    if (!user || !user.email) {  
        return <div>Unauthorized</div>; 
    }

    const workspaces = await prisma.workspace.findMany({
        where: {
            users: {
                some: {
                    user: {
                        email: user.email,  
                    },
                },
            },
        },
        include: {
            users: true, 
        },
    });

    return (
        <div className={cn("min-h-screen flex bg-gray-50")}>
            <Sidebar workspaces={workspaces} currentWorkspaceId={workspaces[0]?.id} />
            <div className={cn("flex-grow flex flex-col", textFont.className)}>
                <Navbar /> 
                <div className="flex-grow flex flex-col pt-16">
                    {children}
                </div>
            </div>
        </div>
    );
}
