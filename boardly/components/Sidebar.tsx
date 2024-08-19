'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid'; 

interface SidebarProps {
  workspaces: { id: string; name: string }[];
  currentWorkspaceId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ workspaces, currentWorkspaceId }) => {
  const pathname = usePathname();
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspace(expandedWorkspace === workspaceId ? null : workspaceId);
  };

  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Workspaces</h2>
      <ul>
        {workspaces.map((workspace) => (
          <li key={workspace.id} className="mb-2">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleWorkspace(workspace.id)}>
              <span
                className={`block p-2 rounded ${
                  currentWorkspaceId === workspace.id ? 'bg-gray-300' : ''
                }`}
              >
                {workspace.name}
              </span>
              <span className="ml-2">
                {expandedWorkspace === workspace.id ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </span>
            </div>
            {expandedWorkspace === workspace.id && (
              <ul className="ml-4 mt-2 space-y-2">
                <li>
                  <Link href={`/dashboard/${workspace.id}/boards`}>
                    <div className={`block p-2 hover:bg-gray-200 rounded ${pathname === `/dashboard/${workspace.id}/boards` ? 'bg-gray-200' : ''}`}>
                      Boards
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href={`/dashboard/${workspace.id}/activity`}>
                    <div className={`block p-2 hover:bg-gray-200 rounded ${pathname === `/dashboard/${workspace.id}/activity` ? 'bg-gray-200' : ''}`}>
                      Activity
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href={`/dashboard/${workspace.id}/settings`}>
                    <div className={`block p-2 hover:bg-gray-200 rounded ${pathname === `/dashboard/${workspace.id}/settings` ? 'bg-gray-200' : ''}`}>
                      Settings
                    </div>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
