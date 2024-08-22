import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { io, Socket } from 'socket.io-client';
import AddIcon from '../icons/AddIcon';
import TaskCard from './TaskCard';
import { Button } from '../ui/button';

export interface Task {
  id: string;
  content: string;
  columnId: string;
}

interface Column {
  id: string;
  name: string;
  items: Task[];
}

interface Columns {
  [key: string]: Column;
}

interface MousePosition {
  x: number;
  y: number;
}

interface BoardProps {
  workspaceId: string;
  boardId: string;
  userId: string; 
}

const Board: React.FC<BoardProps> = ({ boardId, workspaceId, userId }) => {
  const [columns, setColumns] = useState<Columns>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [newColumnName, setNewColumnName] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [otherUsersMousePositions, setOtherUsersMousePositions] = useState<{ [key: string]: MousePosition }>({});
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [columnToRename, setColumnToRename] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000');
    setSocket(socketInstance);
  
    socketInstance.on('mouseMove', (data: { x: number; y: number; userId: string }) => {
      setOtherUsersMousePositions((prev) => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y },
      }));
    });
  
    socketInstance.on('message2', (data) => {
      console.log('Received from server:', data);
      if (data.newColumnOrder) {
        setColumnOrder(data.newColumnOrder);
      }
      if (data.newColumn) {
        setColumns((prevColumns) => ({
          ...prevColumns,
          [data.newColumn.id]: {
            id: data.newColumn.id,
            name: data.newColumn.name,
            items: [],
          },
        }));
        setColumnOrder((prevOrder) => [...prevOrder, data.newColumn.id]);
      }
    });

    socketInstance.on('serverColumnMoved', (data) => {
      console.log('Received serverColumnMoved event:', data);
      setColumnOrder(data.newColumnOrder);
    });

    socketInstance.on('serverColumnDeleted', (data) => {
      console.log('Received serverColumnDeleted event:', data);
      setColumns((prevColumns) => {
        const newColumns = { ...prevColumns };
        delete newColumns[data.columnId];
        return newColumns;
      });
      setColumnOrder(data.newColumnOrder);
    });
  
    return () => {
      socketInstance.disconnect();
    };
  }, [boardId]);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (socket) {
        socket.emit('mouseMove', {
          x: event.clientX,
          y: event.clientY,
          userId: userId,  
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [socket, userId]); 


  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns`);
        const data = await response.json();

        if (data.length === 0) {
          setColumns({});
          setColumnOrder([]);
          return;
        }

        data.sort((a: any, b: any) => a.position - b.position);

        const columnsData: Columns = {};
        const columnIds: string[] = [];

        data.forEach((column: any) => {
          columnsData[column.id] = {
            id: column.id,
            name: column.name,
            items: column.cards.map((card: any) => ({
              id: card.id,
              content: card.content,
              columnId: column.id,
            })),
          };
          columnIds.push(column.id);
        });

        setColumns(columnsData);
        setColumnOrder(columnIds);
      } catch (error) {
        console.error('Error fetching columns:', error);
      }
    };

    if (boardId) {
      fetchColumns();
    }
  }, [boardId, workspaceId]);

  const addColumn = async () => {
    if (!newColumnName.trim()) return;

    const newColumnPosition = columnOrder.length + 1;

    try {
        const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newColumnName, position: newColumnPosition }),
        });

        if (!response.ok) {
            throw new Error('Failed to create column');
        }

        const newColumn = await response.json();

        console.log('Emitting message1 event:', { boardId, newColumn });
        if (socket) {
            socket.emit('message1', { boardId, newColumn });
        }

        setNewColumnName('');
    } catch (error) {
        console.error('Error adding column:', error);
    }
};


  const openRenameDialog = (columnId: string, currentName: string) => {
    setColumnToRename(columnId);
    setNewColumnName(currentName);
    setIsRenameDialogOpen(true);
  };

  const handleRenameColumn = async () => {
    if (columnToRename && newColumnName.trim()) {
      await renameColumn(columnToRename, newColumnName);
      setIsRenameDialogOpen(false);
    }
  };

  const renameColumn = async (columnId: string, newName: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename column');
      }

      setColumns((prevColumns) => ({
        ...prevColumns,
        [columnId]: {
          ...prevColumns[columnId],
          name: newName,
        },
      }));
      if (socket) {
        socket.emit('clientColumnMoved', { boardId, columnId, newName });
      }
    } catch (error) {
      console.error('Error renaming column:', error);
    }
  };

  const deleteColumn = async (columnId: string) => {
    try {
      await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, {
        method: 'DELETE',
      });

      const newColumns = { ...columns };
      delete newColumns[columnId];
      setColumns(newColumns);
      setColumnOrder(columnOrder.filter((id) => id !== columnId));

      if (socket) {
        socket.emit('clientColumnDeleted', { boardId, columnId, newColumnOrder: columnOrder.filter((id) => id !== columnId) });
      }
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const addCard = async (columnId: string) => {
    const cardContent = prompt('Enter card content:', '');
    if (!cardContent) return;

    const newCardPosition = columns[columnId].items.length;

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: cardContent, position: newCardPosition }),
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const newCard = await response.json();

      setColumns((prevColumns) => ({
        ...prevColumns,
        [columnId]: {
          ...prevColumns[columnId],
          items: [...prevColumns[columnId].items, newCard],
        },
      }));
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const deleteCard = async (columnId: string, cardId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      setColumns((prevColumns) => ({
        ...prevColumns,
        [columnId]: {
          ...prevColumns[columnId],
          items: prevColumns[columnId].items.filter((item) => item.id !== cardId),
        },
      }));

      if (socket) {
        socket.emit('cardDeleted', { boardId, columnId, cardId });
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const copyCard = async (columnId: string, cardId: string) => {
    try {
        const cardToCopy = columns[columnId].items.find(card => card.id === cardId);
        if (!cardToCopy) return;

        const newCardContent = `${cardToCopy.content} (Copy)`;
        const newCardPosition = columns[columnId].items.length;

        const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: newCardContent, position: newCardPosition }),
        });

        if (!response.ok) {
            throw new Error('Failed to copy card');
        }

        const newCard = await response.json();

        setColumns(prevColumns => ({
            ...prevColumns,
            [columnId]: {
                ...prevColumns[columnId],
                items: [...prevColumns[columnId].items, newCard],
            },
        }));
    } catch (error) {
        console.error('Error copying card:', error);
    }
};
 
  
  const renameTask = async (columnId: string, cardId: string, newName: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newName }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to rename task');
      }
  
      const updatedColumns = { ...columns };
      const column = updatedColumns[columnId];
      const taskIndex = column.items.findIndex((item) => item.id === cardId);
      column.items[taskIndex].content = newName;
  
      setColumns(updatedColumns);
    } catch (error) {
      console.error('Error renaming task:', error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(columnOrder);
      const [movedColumnId] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, movedColumnId);
      setColumnOrder(newColumnOrder);

      // Update the position of all columns after the move
      try {
        for (let i = 0; i < newColumnOrder.length; i++) {
          const columnId = newColumnOrder[i];
          await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position: i }),
          });
        }
        // Emit an event to the server for the column reorder
        if (socket) {
          socket.emit('clientColumnMoved', { boardId, newColumnOrder });
        }
      } catch (error) {
        console.error('Error saving column order:', error);
      }
    } else {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];

      const sourceItems = Array.from(sourceColumn.items);
      const [movedItem] = sourceItems.splice(source.index, 1);

      if (source.droppableId !== destination.droppableId) {
        const destItems = Array.from(destColumn.items);
        destItems.splice(destination.index, 0, movedItem);

        setColumns({
          ...columns,
          [source.droppableId]: { ...sourceColumn, items: sourceItems },
          [destination.droppableId]: { ...destColumn, items: destItems },
        });

        // Persist card movement to the backend
        try {
          await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${source.droppableId}/cards/${movedItem.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              newColumnId: destination.droppableId,
              newPosition: destination.index,
            }),
          });

          if (socket) {
            socket.emit('cardMoved', { boardId, sourceColumnId: source.droppableId, destColumnId: destination.droppableId, movedItem, newPosition: destination.index });
          }
        } catch (error) {
          console.error('Error saving card position:', error);
        }
      } else {
        sourceItems.splice(destination.index, 0, movedItem);
        setColumns({
          ...columns,
          [source.droppableId]: { ...sourceColumn, items: sourceItems },
        });

        // Persist card reorder to the backend
        try {
          await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${source.droppableId}/cards/${movedItem.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position: destination.index }),
          });

          if (socket) {
            socket.emit('cardMoved', { boardId, sourceColumnId: source.droppableId, destColumnId: destination.droppableId, movedItem, newPosition: destination.index });
          }
        } catch (error) {
          console.error('Error saving card reorder:', error);
        }
      }
    }
  };

  return (
    <div className="p-4 flex flex-col items-start relative"> 
      <h1 className="text-2xl font-semibold mb-4">Your Board</h1>
      <div className="flex justify-center w-full overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex space-x-4"
              >
                {columnOrder.map((columnId, index) => {
                  const column = columns[columnId];

                  return (
                    <Draggable draggableId={columnId} index={index} key={columnId}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex flex-col w-80 bg-gray-100 rounded-lg shadow-md"
                        >
                          <div
                            className="flex justify-between items-center p-4 rounded-t-lg bg-white shadow-sm"
                            {...provided.dragHandleProps}
                          >
                            <h2
                              className="text-left font-semibold"
                              onDoubleClick={() => openRenameDialog(columnId, column.name)} 
                            >
                              {column.name}
                            </h2>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="bg-none border-none cursor-pointer text-gray-500">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-5 w-5"
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
                                <button
                                  onClick={() => openRenameDialog(columnId, column.name)}
                                  className="block w-full p-2 text-left"
                                >
                                  Rename Column
                                </button>
                                <button
                                  onClick={() => deleteColumn(columnId)}
                                  className="block w-full p-2 text-left text-red-600"
                                >
                                  Delete Column
                                </button>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="p-4 space-y-2 flex-grow">
                            <Droppable droppableId={columnId} key={columnId}>
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-2"
                                >
                                  {column.items.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <TaskCard
                                            columnId={columnId}
                                            item={item}
                                            deleteCard={deleteCard}
                                            renameCard={renameTask}
                                            copyCard={copyCard}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  <button
                                    className="mt-2 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-gray-700 w-full text-left"
                                    onClick={() => addCard(columnId)}
                                  >
                                    <AddIcon className="inline h-5 w-5 mr-1" />
                                    Add a card
                                  </button>
                                </div>
                              )}
                            </Droppable>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                <div className="flex flex-col items-center ml-4">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="New List Name"
                    className="mb-2 p-2 border rounded-lg w-80"
                  />
                  <button
                    onClick={addColumn}
                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-gray-700"
                  >
                    <AddIcon className="inline h-5 w-5 mr-1" />
                    Add a list
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {Object.keys(otherUsersMousePositions).map((otherUserId) => (
          otherUserId !== userId && ( 
            <div
              key={otherUserId}
              style={{
                position: 'absolute',
                left: `${otherUsersMousePositions[otherUserId]?.x}px`,
                top: `${otherUsersMousePositions[otherUserId]?.y}px`,
                pointerEvents: 'none',
                backgroundColor: 'red',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
              }}
            />
          )
        ))}
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="New Column Name"
          />
          <DialogFooter>
            <Button onClick={handleRenameColumn}>Save</Button>
            <Button variant="destructive" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Board;

  

