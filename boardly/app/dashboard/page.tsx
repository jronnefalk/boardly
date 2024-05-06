import { getUserInfo } from "@/lib/auth";
import CreateWorkspaceButton from "@/components/createWorkspaceButton";

export default async function DashboardPage() {
    const { isAuthenticated, user } = await getUserInfo();

    return (
        <div>
            <h1>Dashboard</h1>
            {isAuthenticated ? (
                <div>
                    <p>Welcome, {user?.given_name}!</p>

                    {user?.workspaces && user.workspaces.length > 0 ? (
                        <div>
                            <p>Your Workspaces:</p>
                            <ul>
                                {user.workspaces.map((ws) => (
                                    <li key={ws.id}>{ws.name}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>You have no workspaces yet.</p>
                    )}

                    <CreateWorkspaceButton />
                </div>
            ) : (
                <p>User is not authenticated</p>
            )}
        </div>
    );
}
