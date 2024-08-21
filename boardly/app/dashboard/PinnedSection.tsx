import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loading, setLoading] = useState(true);
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  useEffect(() => {
    const fetchPinnedItems = async () => {
      const response = await fetch("/api/pinned");
      const data = await response.json();
      setPinnedItems(data.pinnedItems);
      setLoading(false);
    };

    const fetchWorkspaces = async () => {
      const response = await fetch("/api/workspaces");
      const data = await response.json();
      setWorkspaces(data.workspaces);
    };

    fetchPinnedItems();
    fetchWorkspaces();
  }, []);

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
      <h2 className="text-lg font-semibold mb-4">Pinned Workspaces</h2>

      <DragDropContext onDragEnd={handleReorder}>
        <Droppable droppableId="pinned-items" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex space-x-4 overflow-x-auto"
            >
              {loading && pinnedItems.length === 0
                ? 
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="w-[200px] h-[100px] rounded-md" />
                  ))
                : pinnedItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="min-w-[250px]"
                        >
                          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                              {item.workspaceName && (
                                <CardDescription className="text-sm text-gray-500">
                                  {item.workspaceName}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent>
                              <Button
                                onClick={() => handleUnpin(item.id)}
                                variant="destructive"
                                className="w-full mt-2"
                              >
                                Unpin
                              </Button>
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

      <Popover>
        <PopoverTrigger asChild>
          <Button className="mt-4">Pin Workspace</Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <ul>
            {workspaces.map((workspace) => (
              <li key={workspace.id}>
                <Button
                  onClick={() => setSelectedWorkspace(workspace.id)}
                  className={cn(
                    "block w-full text-left px-4 py-2",
                    selectedWorkspace === workspace.id ? "bg-gray-200" : ""
                  )}
                >
                  {workspace.name}
                </Button>
              </li>
            ))}
          </ul>
          <Button onClick={handlePinWorkspace} className="mt-2 w-full">
            Confirm Pin
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
