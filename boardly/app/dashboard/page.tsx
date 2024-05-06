import CreateWorkspaceButton from "@/components/createWorkspaceButton";
import { getUserInfo } from "@/lib/auth";

export default async function DashboardPage() {
    const { isAuthenticated, user } = await getUserInfo();

    return (
        <div>
            <h1>Dashboard</h1>
            {isAuthenticated ? (
                <div>
                    <p>Welcome, {user?.given_name}!</p>
                    <CreateWorkspaceButton />
                </div>
            ) : (
                <p>User is not authenticated</p>
            )}
        </div>
    );
}
