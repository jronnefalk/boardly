import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AddUserButtonProps {
  workspaceId: string;
}

const AddUserButton: React.FC<AddUserButtonProps> = ({ workspaceId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/inviteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspaceId, email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User added successfully!');
      } else {
        toast.error(data.error || 'Failed to add user');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Error adding user: ' + error.message);
      } else {
        toast.error('An unknown error occurred');
      }
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
        <option value="MEMBER">Member</option>
        <option value="ADMIN">Admin</option>
        <option value="REPORTER">Reporter</option>
      </select>
      <Button onClick={handleAddUser}>Add User</Button>
    </div>
  );
};

export default AddUserButton;
