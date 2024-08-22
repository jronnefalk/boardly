'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import AddUserButton from '@/components/addUserButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/components/WorkspaceContext';

export default function SettingsPage() {
  const { workspaces, removeWorkspace } = useWorkspace();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedWorkspaceId = searchParams?.get('workspaceId') ?? '';
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(selectedWorkspaceId);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLoading(false);
  }, [selectedWorkspaceId]);

  const handleWorkspaceSwitch = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
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
        removeWorkspace(currentWorkspaceId); 
        setCurrentWorkspaceId(workspaces.length > 1 ? workspaces[0]?.id : '');
        toast.success('Workspace deleted successfully!');
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

        {errorMessage && <div className="mt-4 text-red-600">{errorMessage}</div>}
      </div>
    </div>
  );
}
