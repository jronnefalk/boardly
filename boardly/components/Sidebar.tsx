// /components/Sidebar.tsx

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  workspaces: { id: string; name: string }[];
  currentWorkspaceId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ workspaces, currentWorkspaceId }) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Workspaces</h2>
      <ul>
        {workspaces.map((workspace) => (
          <li key={workspace.id} className="mb-2">
            <Link href={`/dashboard?workspaceId=${workspace.id}`}>
              <div
                className={`block p-2 hover:bg-gray-200 rounded ${
                  pathname === `/dashboard?workspaceId=${workspace.id}` ? 'bg-gray-200' : ''
                }`}
              >
                {workspace.name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
