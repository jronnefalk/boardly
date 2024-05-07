import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AddUserButtonProps {
    workspaceId: string;
}

const AddUserButton: React.FC<AddUserButtonProps> = ({ workspaceId }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("MEMBER"); 

    const handleAddUser = async () => {
        try {
            const response = await fetch("/api/addUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ workspaceId, email, role }),
            });

            if (response.ok) {
                // Handle success
                console.log("User added successfully!");
            } else {
                const data = await response.json();
                // Handle error
                console.error("Failed to add user:", data.error);
            }
        } catch (error) {
            // Handle unexpected errors
            console.error("Error adding user:", error);
        }
    };

    return (
        <div>
            <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="REPORTER">Reporter</option>
            </select>
            <Button onClick={handleAddUser}>Add User</Button>
        </div>
    );
};

export default AddUserButton;
