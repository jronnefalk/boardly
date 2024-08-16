import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface AddBoardUserButtonProps {
  boardId: string;
}

export default function AddBoardUserButton({ boardId }: AddBoardUserButtonProps) {
  const { workspaceId } = useParams(); 
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER');

  const handleAddUser = async () => {
    try {
        const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, role }),
          });

      if (response.ok) {
        toast.success('User added to the board!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add user');
      }
    } catch (error: any) {
      toast.error('Error adding user: ' + error.message);
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="VIEWER">Viewer</option>
        <option value="REPORTER">Reporter</option>
        <option value="ADMIN">Admin</option>
      </select>
      <Button onClick={handleAddUser}>Add User</Button>
    </div>
  );
}
