'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Board from '@/components/board/Board';

interface BoardData {
  id: string;
  title: string;
}

export default function BoardsPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params?.workspaceId;  const [boards, setBoards] = useState<BoardData[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); 

  useEffect(() => {
    async function fetchBoards() {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards`);
      const data = await response.json();
      setBoards(data.boards);
    }

    async function fetchUserId() {
      try {
        const response = await fetch('/api/userinfo');
        const data = await response.json();
        setUserId(data.user?.id || null);
        console.log("Fetched userId:", data.user?.id); 
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }


    fetchBoards();
    fetchUserId();
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
        setBoards(boards.filter((board) => board.id !== boardId));
        toast.success('Board deleted successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete board');
      }
    } catch (error: any) {
      toast.error('Error deleting board: ' + error.message);
    }
  };

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoardId(boardId);
  };

  useEffect(() => {
    console.log("Selected Board ID:", selectedBoardId);
    console.log("User ID:", userId); 
  }, [selectedBoardId, userId]);

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
          <li
            key={board.id}
            className="mb-2 flex items-center justify-between cursor-pointer"
            onClick={() => handleSelectBoard(board.id)}
          >
            <span>{board.title}</span>
            <Button onClick={() => handleDeleteBoard(board.id)} variant="destructive">
              Delete
            </Button>
          </li>
        ))}
      </ul>

      {selectedBoardId && userId && workspaceId && (
      <Board workspaceId={workspaceId || ''} boardId={selectedBoardId} userId={userId} />
      )}
    </div>
  );
}
