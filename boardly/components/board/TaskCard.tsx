import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Task } from "./Board";

interface TaskCardProps {
  columnId: string;
  item: Task;
  deleteCard: (columnId: string, cardId: string) => void;
  renameCard: (columnId: string, cardId: string, newName: string) => void;
  copyCard: (columnId: string, cardId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ columnId, item, deleteCard, renameCard, copyCard }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [content, setContent] = useState(item.content);
  
    return (
      <Card className={`p-4 bg-white rounded-lg shadow-sm`}>
        <div className="flex justify-between items-center">
          <div className="font-semibold text-sm text-gray-800">{item.content}</div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-gray-500 hover:text-gray-700 ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDialogOpen(true); 
                }}
                className="block w-full p-2 text-left"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCard(columnId, item.id);
                }}
                className="block w-full p-2 text-left text-red-600"
              >
                Delete
              </button>
            </PopoverContent>
          </Popover>
        </div>
  
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="hidden">Open Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                In list: {columnId}
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edit the task content..."
              className="w-full h-24 p-2 border rounded-md"
            />
            <DialogFooter>
              <Button onClick={() => renameCard(columnId, item.id, content)}>Save</Button>
              <Button onClick={() => copyCard(columnId, item.id)}>Copy</Button>
              <Button variant="destructive" onClick={() => deleteCard(columnId, item.id)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  };
  
  export default TaskCard;
  