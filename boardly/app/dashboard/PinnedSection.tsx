import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PinnedItem {
  id: string;
  title: string;
  type: "workspace" | "board";
  workspaceName?: string;
}

interface Workspace {
  id: string;
  name: string;
}

export const PinnedSection: React.FC = () => {
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  useEffect(() => {
    const fetchPinnedItems = async () => {
      const response = await fetch("/api/pinned");
      const data = await response.json();
      setPinnedItems(data.pinnedItems);
    };

    const fetchWorkspaces = async () => {
      const response = await fetch("/api/workspaces");
      const data = await response.json();
      setWorkspaces(data.workspaces);
    };

    fetchPinnedItems();
    fetchWorkspaces();
  }, []);

  const handleOpenPopover = () => {
    setSelectedWorkspace(null);
  };

  const handleUnpin = async (id: string) => {
    await fetch(`/api/pinned/${id}`, { method: "DELETE" });
    setPinnedItems(pinnedItems.filter((item) => item.id !== id));
    toast.success("Unpinned successfully!");
  };

  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(pinnedItems);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);

    setPinnedItems(items);

    await fetch("/api/pinned/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: items.map((item) => item.id) }),
    });
  };

  const handlePinWorkspace = async () => {
    if (!selectedWorkspace) return;

    try {
      const response = await fetch("/api/pinned", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workspaceId: selectedWorkspace }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setPinnedItems([...pinnedItems, newItem]);
        toast.success("Workspace pinned successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to pin workspace");
      }
    } catch (error) {
      console.error("Error pinning workspace:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="pinned-section mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        Pinned Workspaces
        <Popover>
          <PopoverTrigger asChild onClick={handleOpenPopover}>
            <Button variant="ghost" size="icon" className="ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-2">
            <ul className="space-y-1">
              {workspaces.map((workspace) => (
                <li key={workspace.id}>
                  <Button
                    onClick={() => setSelectedWorkspace(workspace.id)}
                    className={cn(
                      "block w-full text-left px-4 py-2 rounded-md transition-colors duration-200",
                      selectedWorkspace === workspace.id
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                    )}
                  >
                    {workspace.name}
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              onClick={handlePinWorkspace}
              className="w-full mt-4 text-sm py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
            >
              Confirm Pin
            </Button>
          </PopoverContent>
        </Popover>
      </h2>
      
      <DragDropContext onDragEnd={handleReorder}>
        <Droppable droppableId="pinned-items" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex space-x-4 overflow-x-auto"
            >
              {pinnedItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="min-w-[250px]"
                    >
                      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out relative">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                          {item.workspaceName && (
                            <CardDescription className="text-sm text-gray-500">
                              {item.workspaceName}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          {/* Unpin button inside popover */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="absolute top-2 right-2 text-gray-600 hover:text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="p-2 w-auto text-sm">
                              <Button
                                onClick={() => handleUnpin(item.id)}
                                variant="destructive"
                                className="w-full text-xs py-1 px-2"
                              >
                                Unpin
                              </Button>
                            </PopoverContent>
                          </Popover>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );  
  
};
