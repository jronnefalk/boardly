'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Board from '@/components/Board/Board';

interface Board {
  id: string;
  title: string;
}

export default function BoardsPage() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    async function fetchBoards() {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards`);
      const data = await response.json();
      setBoards(data.boards);
    }

    fetchBoards();
  }, [workspaceId]);

  const handleCreateBoard = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newBoardTitle }),
      });

      const data = await response.json();

      if (response.ok) {
        setBoards([...boards, data.board]);
        setNewBoardTitle('');
        toast.success('Board created successfully!');
      } else {
        toast.error(data.error || 'Failed to create board');
      }
    } catch (error: any) {
      toast.error('Error creating board: ' + error.message);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBoards(boards.filter((board) => board.id !== boardId)); // Remove the deleted board from the UI
        toast.success('Board deleted successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete board');
      }
    } catch (error: any) {
      toast.error('Error deleting board: ' + error.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Boards</h1>
      <div className="mb-4">
        <Input
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New Board Title"
        />
        <Button onClick={handleCreateBoard} className="ml-2">
          Create Board
        </Button>
      </div>
      <ul>
        {boards.map((board) => (
          <li key={board.id} className="mb-2 flex items-center justify-between">
            <span>{board.title}</span>
            <Button onClick={() => handleDeleteBoard(board.id)} variant="destructive">
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <Board/>
    </div>
  );
}
