import { format } from "date-fns";
import { ActivityWithUser } from "@/lib/types";
import Link from "next/link";

interface ActivityItemProps {
  data: ActivityWithUser;
}

export const ActivityItem = ({ data }: ActivityItemProps) => {
  return (
    <li className="flex flex-col gap-y-2 mb-3">
      <div className="flex flex-col space-y-0.5">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold lowercase text-neutral-700">
            {data.user.email}
          </span>{" "}
          {data.action}: "{data.description}"
        </p>
        <p className="text-xs text-muted-foreground">
          {data.workspaceName && <span>In: {data.workspaceName}</span>}
          {data.boardName && (
            <Link href={`/dashboard/${data.workspaceId}/boards/${data.boardId}`} className="text-blue-500 hover:underline">
              {" / "}{data.boardName}
            </Link>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(data.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </li>
  );
};
