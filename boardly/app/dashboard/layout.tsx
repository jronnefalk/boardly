import Navbar from "@/components/navbar";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const textFont = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={cn("min-h-screen flex flex-col", textFont.className)}>
            <Navbar />
            <div className="flex-grow flex items-center justify-center flex-col pt-16">
                {children}
            </div>
        </div>
    );
}
