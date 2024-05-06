import { createWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
    try {
        await createWorkspace("My New Workspace");
    } catch (error) {
        console.error("Error creating workspace:", error);
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Workspace created successfully!</p>
        </div>
    );
}
