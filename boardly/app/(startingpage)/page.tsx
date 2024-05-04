import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils"

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
                <h1 className="text-4xl md:text-7xl text-center text-neutral-800 mb-6">
                    Boardly  
                </h1>
                <div className="text-2xl md:text-2xl bg-gradient-to-r from-sky-600 to-sky-300 text-white px-4 p-2 rounded-2xl 2-fit">
                    <p>Empower your workflow</p>
                </div>
            </div>
            <div className={cn(
                "text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl text-center mx-auto",
                textFont.className,
            )}>
            Why choose Boardly?

            Visual Project Management: Easily visualize the stages of your projects with customizable boards.
            Real-Time Collaboration: Make changes, see updates, and communicate in real-time – no refreshes needed.
            All-In-One Tool: From brainstorming ideas to tracking deadlines, Boardly is your go-to for all project management needs.
            Get started today and transform the way your team works!
            </div>
        </div>
    );
};

export default StartingPage;