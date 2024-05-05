import { Logo } from "@/components/logo";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { AuthButtons } from "@/components/authButtons";

export default async function Navbar() {
    const session = getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();

    return (
        <div className="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items together">
            <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
                <Logo />
                <AuthButtons isAuthenticated={isAuthenticated} />
            </div>
        </div>
    );
}
