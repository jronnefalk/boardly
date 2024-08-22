'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import AddUserButton from '@/components/addUserButton';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedWorkspaceId = searchParams?.get('workspaceId') ?? '';
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(selectedWorkspaceId);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const response = await fetch('/api/userinfo');
        const { isAuthenticated, user } = await response.json();

        if (isAuthenticated && user) {
            const userWorkspaces = user.workspaces ?? [];
            setWorkspaces(userWorkspaces);
            setCurrentWorkspaceId(selectedWorkspaceId || (userWorkspaces[0]?.id ?? ''));
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

    fetchWorkspaces();
  }, [selectedWorkspaceId]);

  const handleWorkspaceSwitch = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    router.push(`/dashboard/settings?workspaceId=${workspaceId}`);
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

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Workspace Settings</h1>

        {/* Workspace Selection */}
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

        {/* Actions */}
        <Card className="w-full mt-6 p-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {currentWorkspaceId && (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-2">Workspace Actions</h2>
                <Button onClick={handleDeleteWorkspace} variant="destructive">
                  Delete Workspace
                </Button>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Add User to Workspace</h2>
                <AddUserButton workspaceId={currentWorkspaceId} />
              </div>
            </>
          )}
        </Card>

        {/* Error Message */}
        {errorMessage && <div className="mt-4 text-red-600">{errorMessage}</div>}
      </div>
    </div>
  );
}
