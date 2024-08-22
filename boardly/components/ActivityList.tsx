import { ActivityItem } from "./ActivityItem";
import { ActivityWithUser } from "@/lib/types";

interface ActivityListProps {
  items: ActivityWithUser[];
}

export const ActivityList = ({ items }: ActivityListProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="text-3xl font-bold mb-6">Activity Log</h1> 
      <ul className="space-y-4">
        {items.map((item) => (
          <ActivityItem key={item.id} data={item} />
        ))}
      </ul>
    </div>
  );
};
