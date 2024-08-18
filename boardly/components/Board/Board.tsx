import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import Modal from '../Modal';

export interface Task {
  id: string;
  content: string;
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns`);
        const data = await response.json();

        if (data.length === 0) {
          setColumns({});
          setColumnOrder([]);
          return; // Exit if there are no columns
        }

        const columnsData: Columns = {};
        const columnIds: string[] = [];

        data.forEach((column: any) => {
          columnsData[column.id] = {
            id: column.id,
            name: column.name,
            items: column.cards.map((card: any) => ({
              id: card.id,
              content: card.content,
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
    const newColumnName = `List #${columnOrder.length + 1}`;
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
    } catch (error) {
      console.error('Error adding column:', error);
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
    const newCardContent = `New Task`;
    const newCardPosition = columns[columnId].items.length;

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newCardContent, position: newCardPosition }),
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
        body: JSON.stringify({ cardId }), // Pass cardId in the body
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
  

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(columnOrder);
      const [removed] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, removed);
      setColumnOrder(newColumnOrder);
    } else {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];

      const sourceItems = Array.from(sourceColumn.items);
      const [removed] = sourceItems.splice(source.index, 1);

      if (source.droppableId !== destination.droppableId) {
        const destItems = Array.from(destColumn.items);
        destItems.splice(destination.index, 0, removed);
        setColumns({
          ...columns,
          [source.droppableId]: { ...sourceColumn, items: sourceItems },
          [destination.droppableId]: { ...destColumn, items: destItems },
        });
      } else {
        sourceItems.splice(destination.index, 0, removed);
        setColumns({
          ...columns,
          [source.droppableId]: { ...sourceColumn, items: sourceItems },
        });
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
                            <h2>{column.name}</h2>
                            <button
                              onClick={() => deleteColumn(columnId)}
                              style={{ marginLeft: 'auto' }}
                            >
                              Delete List
                            </button>
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
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                          {item.content}
                                          <button
                                            onClick={() => deleteCard(columnId, item.id)}
                                            style={{ marginLeft: 'auto' }}
                                          >
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
                  onClick={addColumn}
                >
                  <h2>+ Add a list</h2>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <Modal
        task={selectedTask}
        columnName={selectedColumnId ? columns[selectedColumnId]?.name : null}
        onClose={() => {}}
        onSave={() => {}}
        onDelete={() => {}}
        onCopy={() => {}}
      />
    </div>
  );
};

export default Board;
