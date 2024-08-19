'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import CreateWorkspaceButton from '@/components/createWorkspaceButton';
import { Button } from '@/components/ui/button';
import { Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import AddUserButton from '@/components/addUserButton';
import ChangeUserRoleButton from '@/components/changeUserRoleButton';
import { toast } from 'sonner';

const textFont = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

interface Workspace {
  id: string;
  name: string;
  users: {
    id: string;
    role: string;
    user: {
      id: string;
      email: string;
    };
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedWorkspaceId = searchParams.get('workspaceId') ?? '';
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [userName, setUserName] = useState('');
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(selectedWorkspaceId);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchUserInfo() {
      const response = await fetch('/api/userinfo');
      const { isAuthenticated, user } = await response.json();

      if (isAuthenticated && user) {
        const userWorkspaces = user.workspaces ?? [];
        setWorkspaces(userWorkspaces);
        setUserName(user.given_name ?? 'User');
        setCurrentWorkspaceId(userWorkspaces[0]?.id ?? '');
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
  
    const confirmed = window.confirm('Are you sure you want to delete this workspace?');
    if (!confirmed) {
      return;
    }
  
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspaceId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setWorkspaces((prev) => prev.filter((ws) => ws.id !== currentWorkspaceId));
        setCurrentWorkspaceId(workspaces.length > 1 ? workspaces[0]?.id : ''); // Switch to another workspace or clear the selection
        toast.success('Workspace deleted successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to delete workspace');
        toast.error(data.error || 'Failed to delete workspace');
      }
    } catch (error: any) {
      setErrorMessage('An unexpected error occurred');
      toast.error('Error deleting workspace: ' + error.message);
    }
  };  
  

  const handleAddWorkspace = (newWorkspace: Workspace) => {
    setWorkspaces((prev) => [...prev, newWorkspace]);
    setCurrentWorkspaceId(newWorkspace.id);
    router.push(`/dashboard?workspaceId=${newWorkspace.id}`);  
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className={cn('text-4xl mb-4 text-black', textFont.className)}>Welcome, {userName}!</h2>

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
        <CreateWorkspaceButton onWorkspaceCreated={handleAddWorkspace} />
        {currentWorkspaceId && (
          <Button onClick={handleDeleteWorkspace} variant="destructive">
            Delete Workspace
          </Button>
        )}
      </div>

      {currentWorkspaceId && (
        <div className="flex space-x-2 mt-4">
          <AddUserButton workspaceId={currentWorkspaceId} />
        </div>
      )}

      {currentWorkspaceId && (
        <div className="flex flex-col space-y-2 mt-4">
          {workspaces.find((ws) => ws.id === currentWorkspaceId)?.users?.map((userWorkspace) => (
            <ChangeUserRoleButton
              key={userWorkspace.user.id}
              workspaceId={currentWorkspaceId}
              userId={userWorkspace.user.id}
              currentRole={userWorkspace.role}
            />
          ))}
        </div>
      )}

      {errorMessage && <div className="mt-4 text-red-600">{errorMessage}</div>}
    </div>
  );
}
