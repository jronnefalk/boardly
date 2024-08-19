import { Activity } from "@prisma/client";

export const generateLogMessage = (activity: Activity) => {
  const { action, description } = activity;

  switch (action) {
    case "created card":
      return `created a card: "${description}"`;
    case "created column":
      return `created a column: "${description}"`;
    case "created board":
      return `created a board: "${description}"`;
    case "updated card":
      return `updated the card: "${description}"`;
    case "deleted card":
      return `deleted the card: "${description}"`;
    default:
      return `performed an action: "${description}"`;
  }
};
