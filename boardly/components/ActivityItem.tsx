import { format } from "date-fns";
import { Activity } from "@prisma/client";
import { generateLogMessage } from "@/lib/generateLogMessage";

// Define a custom type that includes the user relationship
interface ActivityWithUser extends Activity {
  user: {
    email: string;
  };
}

interface ActivityItemProps {
  data: ActivityWithUser;
}

export const ActivityItem = ({ data }: ActivityItemProps) => {
  return (
    <li className="flex items-center gap-x-2">
      <div className="flex flex-col space-y-0.5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold lowercase text-neutral-700">
            {data.user.email}
          </span>{" "}
          {generateLogMessage(data)}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </li>
  );
};
