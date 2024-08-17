import React, { useState } from 'react';
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

const initialTasks: Task[] = [
  { id: '1', content: 'Task #1' },
  { id: '2', content: 'Task #2' },
];

const initialColumns: Columns = {
  'column-1': {
    id: 'column-1',
    name: 'List #1',
    items: initialTasks,
  },
  'column-2': {
    id: 'column-2',
    name: 'List #2',
    items: [],
  },
};

const Board: React.FC = () => {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  const openModal = (task: Task, columnId: string) => {
    setSelectedTask(task);
    setSelectedColumnId(columnId);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setSelectedColumnId(null);
  };

  const saveTaskContent = (content: string) => {
    if (selectedTask && selectedColumnId) {
      setColumns({
        ...columns,
        [selectedColumnId]: {
          ...columns[selectedColumnId],
          items: columns[selectedColumnId].items.map((item) =>
            item.id === selectedTask.id ? { ...item, content } : item
          ),
        },
      });
      closeModal();
    }
  };

  const deleteTask = () => {
    if (selectedTask && selectedColumnId) {
      deleteCard(selectedColumnId, selectedTask.id);
      closeModal();
    }
  };

  const copyTask = () => {
    if (selectedTask && selectedColumnId) {
      const newTaskId = `task-${Date.now()}`;
      const newTask = { ...selectedTask, id: newTaskId };
      setColumns({
        ...columns,
        [selectedColumnId]: {
          ...columns[selectedColumnId],
          items: [...columns[selectedColumnId].items, newTask],
        },
      });
      closeModal();
    }
  };

  const addColumn = () => {
    const newColumnId = `column-${Object.keys(columns).length + 1}`;
    setColumns({
      ...columns,
      [newColumnId]: {
        id: newColumnId,
        name: `List #${Object.keys(columns).length + 1}`,
        items: [],
      },
    });
  };

  const addCard = (columnId: string) => {
    const newCardId = `task-${Date.now()}`;
    const newCard: Task = { id: newCardId, content: `New Task` };
    setColumns({
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: [...columns[columnId].items, newCard],
      },
    });
  };

  const deleteCard = (columnId: string, cardId: string) => {
    setColumns({
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: columns[columnId].items.filter((item) => item.id !== cardId),
      },
    });
  };

  const deleteColumn = (columnId: string) => {
    const newColumns = { ...columns };
    delete newColumns[columnId];
    setColumns(newColumns);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Test Board #1</h1>
      <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([columnId, column]) => {
            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  margin: '0 8px',
                  background: '#f4f5f7',
                  borderRadius: 3,
                  padding: 8,
                }}
                key={columnId}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <h2>{column.name}</h2>
                  <button onClick={() => deleteColumn(columnId)} style={{ marginLeft: 'auto' }}>
                    Delete List
                  </button>
                </div>
                <div style={{ margin: 8 }}>
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
              </div>
            );
          })}
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
        </DragDropContext>
      </div>
      <Modal
        task={selectedTask}
        columnName={selectedColumnId ? columns[selectedColumnId]?.name : null}
        onClose={closeModal}
        onSave={saveTaskContent}
        onDelete={deleteTask}
        onCopy={copyTask}
      />
    </div>
  );
};

export default Board;
