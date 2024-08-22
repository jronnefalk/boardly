'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import CreateWorkspaceButton from '@/components/createWorkspaceButton';
import BoardIcon from '@/components/icons/BoardIcon';
import ActivityIcon from '@/components/icons/ActivityIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';
import { useWorkspace } from '@/components/WorkspaceContext';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { workspaces, addWorkspace, removeWorkspace } = useWorkspace(); // Use context
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  const toggleWorkspace = (workspaceId: string) => {
    const newExpandedWorkspaces = new Set(expandedWorkspaces);
    if (newExpandedWorkspaces.has(workspaceId)) {
      newExpandedWorkspaces.delete(workspaceId); 
    } else {
      newExpandedWorkspaces.add(workspaceId); 
    }
    setExpandedWorkspaces(newExpandedWorkspaces);
  };

  const handleWorkspaceCreated = (newWorkspace: { id: string; name: string }) => {
    addWorkspace(newWorkspace);
    setSelectedWorkspaceId(newWorkspace.id);
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-r border-gray-200 flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-semibold text-gray-800">Workspaces</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-gray-600 hover:text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-4 bg-white shadow-lg rounded-md">
            <CreateWorkspaceButton onWorkspaceCreated={handleWorkspaceCreated} />
          </PopoverContent>
        </Popover>
      </div>
      <ul className="space-y-2">
        {workspaces.map((workspace) => (
          <li key={workspace.id}>
            <div
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer ${
                expandedWorkspaces.has(workspace.id) ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleWorkspace(workspace.id)}
            >
              <span className="text-sm font-medium text-gray-800">
                {workspace.name}
              </span>
              <span>
                {expandedWorkspaces.has(workspace.id) ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </span>
            </div>
            {expandedWorkspaces.has(workspace.id) && (
              <ul className="ml-4 mt-2 space-y-1">
                <li>
                  <Link href={`/dashboard/${workspace.id}/boards`}>
                    <div className="flex items-center text-sm text-gray-700 p-2 hover:bg-gray-50 rounded-lg">
                      <BoardIcon />
                      <span
                        className={`ml-2 ${
                          pathname === `/dashboard/${workspace.id}/boards` ? 'bg-gray-100 font-medium' : ''
                        }`}
                      >
                        Boards
                      </span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href={`/dashboard/${workspace.id}/activity`}>
                    <div className="flex items-center text-sm text-gray-700 p-2 hover:bg-gray-50 rounded-lg">
                      <ActivityIcon />
                      <span
                        className={`ml-2 ${
                          pathname === `/dashboard/${workspace.id}/activity` ? 'bg-gray-100 font-medium' : ''
                        }`}
                      >
                        Activity
                      </span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings">
                    <div className="flex items-center text-sm text-gray-700 p-2 hover:bg-gray-50 rounded-lg">
                      <SettingsIcon />
                      <span
                        className={`ml-2 ${
                          pathname === '/dashboard/settings' ? 'bg-gray-100 font-medium' : ''
                        }`}
                      >
                        Settings
                      </span>
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
