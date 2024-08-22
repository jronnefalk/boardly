'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Board from '@/components/board/Board';

const BoardPage = () => {
  const params = useParams<{ workspaceId: string; boardId: string }>();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/userinfo');
        const data = await response.json();

        if (data.user?.id) {
          setUserId(data.user.id);
        } else {
          console.error('User not authenticated or user ID not available');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserId();
  }, []);

  if (!params?.workspaceId || !params?.boardId || !userId) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Board workspaceId={params.workspaceId} boardId={params.boardId} userId={userId} />
    </div>
  );
};

export default BoardPage;
