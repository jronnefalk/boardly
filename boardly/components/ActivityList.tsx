import { ActivityItem } from "./ActivityItem";
import { ActivityWithUser } from "@/lib/types";

interface ActivityListProps {
  items: ActivityWithUser[];
}

export const ActivityList = ({ items }: ActivityListProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-2xl font-bold text-neutral-800 mb-4 mt-4">Activity Log</h2> 
      <ul className="space-y-4">
        {items.map((item) => (
          <ActivityItem key={item.id} data={item} />
        ))}
      </ul>
    </div>
  );
};
