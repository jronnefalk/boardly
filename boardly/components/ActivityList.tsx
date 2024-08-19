import { ActivityItem } from "./ActivityItem";

// Use the custom type that includes the user relationship
interface ActivityWithUser {
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
}

interface ActivityListProps {
  items: ActivityWithUser[];
}

export const ActivityList = ({ items }: ActivityListProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <p className="font-semibold text-neutral-700 mb-2">Activity Log</p>
      <ul className="space-y-4">
      {items.map((item) => (
        <ActivityItem key={item.id} data={item} />
      ))}
      </ul>
    </div>
  );
};
