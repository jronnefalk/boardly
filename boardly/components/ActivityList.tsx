import { ActivityItem } from "./ActivityItem";
import { ActivityWithUser } from "@/lib/types";

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
