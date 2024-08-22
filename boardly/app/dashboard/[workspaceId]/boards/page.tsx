'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

interface BoardData {
  id: string;
  title: string;
}

export default function BoardsPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params?.workspaceId;
  const [boards, setBoards] = useState<BoardData[]>([]);
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
      } catch (error) {
        console.error('Error fetching user info:', error);
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
    router.push(`/dashboard/${workspaceId}/boards/${boardId}`);
  };

  const handleReorder = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedBoards = Array.from(boards);
    const [movedBoard] = reorderedBoards.splice(result.source.index, 1);
    reorderedBoards.splice(result.destination.index, 0, movedBoard);

    setBoards(reorderedBoards);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Boards</h1>
      <div className="mb-4 flex items-center">
        <Input
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New Board Title"
          className="mr-2"
        />
        <Button onClick={handleCreateBoard}>
          Create Board
        </Button>
      </div>

      <DragDropContext onDragEnd={handleReorder}>
        <Droppable droppableId="boards-list" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex space-x-4 overflow-x-auto"
            >
              {boards.map((board, index) => (
                <Draggable key={board.id} draggableId={board.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="min-w-[250px] cursor-pointer"
                      onClick={() => handleSelectBoard(board.id)}
                    >
                      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out relative">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl font-bold">{board.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="absolute top-2 right-2 text-gray-600 hover:text-black">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                  />
                                </svg>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" sideOffset={8}>
                              <Button
                                onClick={() => handleDeleteBoard(board.id)}
                                variant="destructive"
                                className="w-full text-xs py-1 px-2"
                              >
                                Delete
                              </Button>
                            </PopoverContent>
                          </Popover>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
