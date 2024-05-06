import { Logo } from "@/components/logo";
import { AuthButtons } from "@/components/authButtons";
import { getUserInfo } from "@/lib/auth";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const textFont = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default async function Navbar() {
    const { isAuthenticated } = await getUserInfo();

    return (
        <div className="fixed top-0 w-full h-16 px-4 border-b shadow-sm bg-gradient-to-r from-sky-300 to-sky-600 text-white flex items-center">
            <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                <div className="flex items-center space-x-4">
                    <Logo />
                    <span className={cn("text-2xl", textFont.className)}>Dashboard</span>
                </div>
                <AuthButtons isAuthenticated={isAuthenticated} />
            </div>
        </div>
    );
}
