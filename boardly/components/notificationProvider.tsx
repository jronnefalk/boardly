import { Toaster } from "./ui/sonner";
import { ReactNode } from "react";

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
};
