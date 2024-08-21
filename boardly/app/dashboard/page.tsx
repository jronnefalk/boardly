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
import DashboardActivityFeed from '@/components/DashboardActivityFeed';
import { toast } from 'sonner';
import { PinnedSection } from './PinnedSection';
import { Skeleton } from '@/components/ui/skeleton';

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
  const selectedWorkspaceId = searchParams?.get('workspaceId') ?? '';
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(selectedWorkspaceId);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch('/api/userinfo');
        const { isAuthenticated, user } = await response.json();

        if (isAuthenticated && user) {
          const userWorkspaces = user.workspaces ?? [];
          setWorkspaces(userWorkspaces);
          setUserName(user.given_name || user.email || 'User');
          setCurrentWorkspaceId(userWorkspaces[0]?.id ?? '');
        } else {
          setErrorMessage('User not authenticated');
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        setErrorMessage('Failed to fetch user info');
      } finally {
        setLoading(false);
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
        setCurrentWorkspaceId(workspaces.length > 1 ? workspaces[0]?.id : '');
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
    const { id, name } = newWorkspace;
    setWorkspaces((prev) => [...prev, newWorkspace]);
    setCurrentWorkspaceId(id);
    router.push(`/dashboard?workspaceId=${id}`);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className={cn('text-4xl mb-4 text-black', textFont.className)}>
        {loading ? <Skeleton className="w-[200px] h-[40px] rounded" /> : `Welcome, ${userName}!`}
      </h2>
      <PinnedSection />
      <DashboardActivityFeed />

      {loading ? (
        <Skeleton className="w-[200px] h-[40px] rounded mt-4" />
      ) : (
        workspaces.length > 0 && (
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
        )
      )}

      <div className="flex space-x-2 mt-4">
        <CreateWorkspaceButton onWorkspaceCreated={(ws) => handleAddWorkspace({ id: ws.id, name: ws.name, users: [] })} />
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
