"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import CreateWorkspaceButton from "@/components/createWorkspaceButton";

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedWorkspaceId = searchParams.get("workspaceId") ?? "";

    const [workspaces, setWorkspaces] = useState<{ id: string; name: string }[]>([]);
    const [userName, setUserName] = useState("");
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState(selectedWorkspaceId);

    useEffect(() => {
        async function fetchUserInfo() {
            const response = await fetch("/api/userinfo");
            const { isAuthenticated, user } = await response.json();

            if (isAuthenticated && user) {
                const userWorkspaces = user.workspaces ?? [];
                setWorkspaces(userWorkspaces);
                setUserName(user.given_name ?? "User");
                setCurrentWorkspaceId(userWorkspaces[0]?.id ?? "");
            }
        }

        fetchUserInfo();
    }, []);

    const handleWorkspaceSwitch = (workspaceId: string) => {
        setCurrentWorkspaceId(workspaceId);
        router.push(`/dashboard?workspaceId=${workspaceId}`);
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome, {userName}!</p>

            {workspaces.length > 0 && (
                <Select onValueChange={handleWorkspaceSwitch} defaultValue={currentWorkspaceId}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a workspace" />
                    </SelectTrigger>
                    <SelectContent>
                        {workspaces.map((ws) => (
                            <SelectItem key={ws.id} value={ws.id}>
                                {ws.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <CreateWorkspaceButton />
        </div>
    );
}
