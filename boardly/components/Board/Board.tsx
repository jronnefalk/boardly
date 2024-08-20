import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Modal from '../Modal';
import { io, Socket } from 'socket.io-client';

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

interface BoardProps {
  boardId: string;
  workspaceId: string;
}

const Board: React.FC<BoardProps> = ({ boardId, workspaceId }) => {
  const [columns, setColumns] = useState<Columns>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [newColumnName, setNewColumnName] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000');
    setSocket(socketInstance);

    socketInstance.on('message2', (data) => {
      console.log('Received from server:', data);
      // Handle the real-time update logic here
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

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

      setColumns({
        ...columns,
        [newColumn.id]: {
          id: newColumn.id,
          name: newColumn.name,
          items: [],
        },
      });
      setColumnOrder([...columnOrder, newColumn.id]);
      setNewColumnName(''); // Clear the input field after adding

      // Emit an event to the server for the new column
      if (socket) {
        socket.emit('message1', { boardId, newColumn });
            }
    } catch (error) {
      console.error('Error adding column:', error);
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

      setColumns({
        ...columns,
        [columnId]: {
          ...columns[columnId],
          name: newName,
        },
      });
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

      setColumns({
        ...columns,
        [columnId]: {
          ...columns[columnId],
          items: [...columns[columnId].items, newCard],
        },
      });
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
  
      setColumns({
        ...columns,
        [columnId]: {
          ...columns[columnId],
          items: columns[columnId].items.filter((item) => item.id !== cardId),
        },
      });
    } catch (error) {
      console.error('Error deleting card:', error);
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
            body: JSON.stringify({ position: i }), // Update the position in the backend
          });
        }
        // Emit an event to the server for the column reorder
        if (socket) {
          socket.emit('message1', { boardId, newColumnOrder });
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
        } catch (error) {
          console.error('Error saving card reorder:', error);
        }
      }
    }
  };
  

  const openModal = (task: Task, columnId: string) => {
    setSelectedTask(task);
    setSelectedColumnId(columnId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setSelectedColumnId(null);
    setIsModalOpen(false);
  };

  const saveTaskContent = async (content: string) => {
    if (selectedTask && selectedColumnId) {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${selectedColumnId}/cards/${selectedTask.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to save task content');
        }

        const updatedColumns = { ...columns };
        const column = updatedColumns[selectedColumnId];
        const taskIndex = column.items.findIndex((item) => item.id === selectedTask.id);
        column.items[taskIndex].content = content;

        setColumns(updatedColumns);
        closeModal();
      } catch (error) {
        console.error('Error saving task content:', error);
      }
    }
  };

  const copyTask = async () => {
    if (selectedTask && selectedColumnId) {
      try {
        const newTaskContent = `${selectedTask.content} (copy)`;
        const newTaskPosition = columns[selectedColumnId].items.length;
  
        const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${selectedColumnId}/cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newTaskContent, position: newTaskPosition }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to copy card');
        }
  
        const newCard = await response.json();
  
        setColumns({
          ...columns,
          [selectedColumnId]: {
            ...columns[selectedColumnId],
            items: [...columns[selectedColumnId].items, newCard],
          },
        });
  
        closeModal();
      } catch (error) {
        console.error('Error copying card:', error);
      }
    }
  };  
  

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Your Board</h1>
      <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex' }}>
                {columnOrder.map((columnId, index) => {
                  const column = columns[columnId];

                  return (
                    <Draggable draggableId={columnId} index={index} key={columnId}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            margin: '0 8px',
                            background: '#f4f5f7',
                            borderRadius: 3,
                            padding: 8,
                          }}
                        >
                          <div
                            style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                            {...provided.dragHandleProps}
                          >
                            <h2
                              onDoubleClick={() => {
                                const newName = prompt('Enter new list name', column.name);
                                if (newName) renameColumn(columnId, newName);
                              }}
                            >
                              {column.name}
                            </h2>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                                  ⋮
                                </button>
                              </PopoverTrigger>
                              <PopoverContent align="end" sideOffset={8}>
                                <button
                                  onClick={() => {
                                    const newName = prompt('Enter new list name', column.name);
                                    if (newName) renameColumn(columnId, newName);
                                  }}
                                  style={{ display: 'block', width: '100%', padding: '8px', textAlign: 'left' }}
                                >
                                  Rename Column
                                </button>
                                <button
                                  onClick={() => deleteColumn(columnId)}
                                  style={{ display: 'block', width: '100%', padding: '8px', textAlign: 'left', color: 'red' }}
                                >
                                  Delete Column
                                </button>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <Droppable droppableId={columnId} key={columnId}>
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{
                                  background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                                  padding: 4,
                                  width: 250,
                                  minHeight: 500,
                                }}
                              >
                                {column.items.map((item, index) => (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          userSelect: 'none',
                                          padding: 16,
                                          margin: '0 0 8px 0',
                                          minHeight: '50px',
                                          backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
                                          color: 'white',
                                          ...provided.draggableProps.style,
                                        }}
                                        onClick={() => openModal(item, columnId)}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                          {item.content}
                                          <button onClick={(e) => { e.stopPropagation(); deleteCard(columnId, item.id); }} style={{ marginLeft: 'auto' }}>
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button
                                  style={{ marginTop: 8, padding: 8, cursor: 'pointer' }}
                                  onClick={() => addCard(columnId)}
                                >
                                  + Add a card
                                </button>
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginLeft: 8,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="New List Name"
                    style={{ marginBottom: '8px' }}
                  />
                  <button onClick={addColumn}>+ Add a list</button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      {isModalOpen && selectedTask && (
        <Modal
          task={selectedTask}
          columnName={selectedColumnId ? columns[selectedColumnId]?.name : null}
          onClose={closeModal}
          onSave={saveTaskContent}
          onDelete={() => deleteCard(selectedColumnId!, selectedTask.id)}
          onCopy={copyTask}
        />
      )}
    </div>
  );
};


export default Board;
