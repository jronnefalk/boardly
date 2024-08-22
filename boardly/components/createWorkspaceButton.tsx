'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CreateWorkspaceButtonProps {
  onWorkspaceCreated: (workspace: { id: string; name: string }) => void;
}

export default function CreateWorkspaceButton({ onWorkspaceCreated }: CreateWorkspaceButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const router = useRouter();

  const handleCreateWorkspace = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspaceName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Workspace created successfully!');
        onWorkspaceCreated(data.workspace); 
      } else {
        toast.error(data.error || 'Failed to create workspace');
      }
    } catch (error: any) {
      toast.error('Error creating workspace: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="workspace-name">Workspace Name</Label>
      <Input
        id="workspace-name"
        placeholder="Workspace Name"
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
      />
      <Button onClick={handleCreateWorkspace} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create'}
      </Button>
    </div>
  );
}
