import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
    <div className="flex flex-col space-y-3">
      <Input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full"
      />
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MEMBER">Member</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="REPORTER">Reporter</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleAddUser} className="w-full">
        Add User
      </Button>
    </div>
  );
};

export default AddUserButton;
