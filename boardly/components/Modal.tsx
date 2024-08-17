import React, { useState } from 'react';
import { Task } from './Board/Board';

interface ModalProps {
  task: Task | null;
  columnName: string | null;
  onClose: () => void;
  onSave: (content: string) => void;
  onDelete: () => void;
  onCopy: () => void;
}

const Modal: React.FC<ModalProps> = ({ task, columnName, onClose, onSave, onDelete, onCopy }) => {
  const [content, setContent] = useState(task?.content || '');

  if (!task) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 5,
          minWidth: '300px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{task.content}</h2>
        <p>In list: {columnName}</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a more detailed description..."
          style={{ width: '100%', height: '100px', marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => onSave(content)}>Save</button>
          <button onClick={onCopy}>Copy</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
