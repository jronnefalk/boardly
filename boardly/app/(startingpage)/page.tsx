import Link from "next/link";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";

const textFont = Poppins({
    subsets: ["latin"],
    weight: [
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
    ],
});

const StartingPage = () => {
    return (
        <div className="flex items-center justify-center flex-col">
            <div className={cn(
                "flex items-center justify-center flex-col",
                textFont.className,
            )}>
                <h1 className="text-3xl md:text-6xl text-center text-neutral-800 mb-6">
                    Boardly  
                </h1>
                <div className="text-3xl md:text-6xl bg-gradient-to-r from-sky-600 to-sky-300 text-white px-4 p-2 rounded-2xl pb-4 2-fit">
                    Empower your workflow
                </div>
            </div>
            <div className={cn(
                "text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl text-center mx-auto",
                textFont.className,
            )}>
            Why Choose Boardly?

            Visual Project Management: Easily visualize the stages of your projects with customizable boards.
            Real-Time Collaboration: Make changes, see updates, and communicate in real-time – no refreshes needed.
            All-In-One Tool: From brainstorming ideas to tracking deadlines, Boardly is your go-to for all project management needs.
            Get started today and transform the way your team works!
            </div>
            <Button className="mt-6" size="lg" asChild >
                <Link href="/sign-up">
                    Test button
                </Link>
            </Button>
        </div>
        
    );
};

export default StartingPage;