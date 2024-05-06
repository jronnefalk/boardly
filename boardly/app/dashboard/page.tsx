"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import CreateWorkspaceButton from "@/components/createWorkspaceButton";
import { Button } from "@/components/ui/button";

interface Workspace {
    id: string;
    name: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedWorkspaceId = searchParams.get("workspaceId") ?? "";
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [userName, setUserName] = useState("");
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState(selectedWorkspaceId);
    const [errorMessage, setErrorMessage] = useState("");

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

    const handleDeleteWorkspace = async () => {
        if (!currentWorkspaceId) {
            return;
        }

        const confirmed = window.confirm("Are you sure you want to delete this workspace?");
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/workspaces?id=${currentWorkspaceId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setWorkspaces((prev) => prev.filter((ws) => ws.id !== currentWorkspaceId));
                setCurrentWorkspaceId(workspaces[0]?.id ?? "");
                setErrorMessage("");
                router.push("/dashboard");
            } else {
                const data = await response.json();
                setErrorMessage(data.error || "Failed to delete workspace");
                console.error("Failed to delete workspace:", data);
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred");
            console.error("Error deleting workspace:", error);
        }
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

            <div className="flex space-x-2 mt-4">
                <CreateWorkspaceButton />
                {currentWorkspaceId && (
                    <Button onClick={handleDeleteWorkspace} variant="destructive">
                        Delete Workspace
                    </Button>
                )}
            </div>

            {errorMessage && (
                <div className="mt-4 text-red-600">
                    {errorMessage}
                </div>
            )}
        </div>
    );
}
