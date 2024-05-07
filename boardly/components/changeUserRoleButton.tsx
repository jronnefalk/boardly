"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function ChangeUserRoleButton({ workspaceId, userId, currentRole }: { workspaceId: string, userId: string, currentRole: string }) {
    const [role, setRole] = useState(currentRole);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleChangeRole = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch("/api/role", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ workspaceId, userId, role }),
            });

            if (!response.ok) {
                console.error("Failed to update role");
            }
        } catch (error) {
            console.error("Error updating role:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex flex-col space-y-2">
            <Label htmlFor="role">Change Role</Label>
            <Select onValueChange={setRole} defaultValue={role}>
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="REPORTER">Reporter</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleChangeRole} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update"}
            </Button>
        </div>
    );
}
