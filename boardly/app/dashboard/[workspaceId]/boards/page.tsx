'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddUserButton from '@/components/addUserButton';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import AddIcon from '@/components/icons/AddIcon';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);


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
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Your Boards</h1>

      <DragDropContext onDragEnd={handleReorder}>
        <Droppable droppableId="boards-list" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-4 gap-4"
            >
              {boards.map((board, index) => (
                <Draggable key={board.id} draggableId={board.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="cursor-pointer h-32"
                      onClick={() => handleSelectBoard(board.id)}
                    >
                      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out relative h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-bold">{board.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="absolute top-2 right-2 text-gray-600 hover:text-black p-1"
                              onClick={(e) => e.stopPropagation()} 
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-4 h-4"
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
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleDeleteBoard(board.id);
                              }}
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

              <div
                className="h-32 flex justify-center items-center bg-gray-100 border-dashed border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                onClick={() => setIsDialogOpen(true)}
              >
                <AddIcon className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <Input
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            placeholder="Board Title"
            className="mb-4"
          />
          <DialogFooter>
            <Button 
              onClick={handleCreateBoard}
              className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
              >
              Create
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}