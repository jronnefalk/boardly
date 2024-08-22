import { Activity } from "@prisma/client";

export const generateLogMessage = (activity: Activity) => {
  const { action, description } = activity;

  switch (action) {
    case "created card":
      return `"${description}"`;
    case "created column":
      return `"${description}"`;
    case "created board":
      return `"${description}"`;
    case "updated card":
      return `"${description}"`;
    case "deleted card":
      return `"${description}"`;
    default:
      return `"${description}"`;
  }
};
