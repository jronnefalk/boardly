export interface ActivityWithUser {
  id: string;
  action: string;
  description: string;
  createdAt: Date;
  userId: string;
  boardId: string | null;
  columnId: string | null;
  cardId: string | null;
  workspaceId: string;
  user: {
    email: string;
  };
  workspaceName: string | null;  
  boardName: string | null;       
}
