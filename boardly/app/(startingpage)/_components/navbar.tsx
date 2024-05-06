import { Logo } from "@/components/logo";
import { AuthButtons } from "@/components/authButtons";
import { getUserInfo } from "@/lib/auth";

export default async function Navbar() {
    const { isAuthenticated } = await getUserInfo();

    return (
        <div className="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items-center">
            <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                <Logo />
                <AuthButtons isAuthenticated={isAuthenticated} />
            </div>
        </div>
    );
}
