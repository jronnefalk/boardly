'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CreateWorkspaceButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
        router.push('/dashboard');
        setIsPopoverOpen(false);
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
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button onClick={() => setIsPopoverOpen(true)}>Create Workspace</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
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
      </PopoverContent>
    </Popover>
  );
}
