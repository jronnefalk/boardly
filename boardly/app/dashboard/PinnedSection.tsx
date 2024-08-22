import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; 
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
  workspaceId: string; 
}

interface Workspace {
  id: string;
  name: string;
}

export const PinnedSection: React.FC = () => {
  const router = useRouter(); 
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ workspaceId: string; boardId?: string | null }>({ workspaceId: '', boardId: null });
  const [boardsByWorkspace, setBoardsByWorkspace] = useState<{ [workspaceId: string]: PinnedItem[] }>({});
  const [hoveredWorkspaceId, setHoveredWorkspaceId] = useState<string | null>(null);

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

  const handleWorkspaceHover = async (workspaceId: string) => {
    setHoveredWorkspaceId(workspaceId);
  
    if (!boardsByWorkspace[workspaceId]) {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/boards`);
        const data = await response.json();
        setBoardsByWorkspace(prev => ({
          ...prev,
          [workspaceId]: data.boards,
        }));
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    }
  };

  const handleOpenPopover = () => {
    setSelectedItem({ workspaceId: '', boardId: null });
    setHoveredWorkspaceId(null);
  };

  const handleUnpin = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); 
    try {
      const response = await fetch(`/api/pinned/${id}`, { method: "DELETE" });
  
      if (response.ok) {
        setPinnedItems(pinnedItems.filter((item) => item.id !== id));
        toast.success("Unpinned successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to unpin");
      }
    } catch (error) {
      toast.error("An error occurred while unpinning the item");
    }
  };

  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(pinnedItems);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setPinnedItems(reorderedItems);

    await fetch("/api/pinned/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reorderedItems.map(item => item.id) }),
    });
};



  const handlePinWorkspaceOrBoard = async () => {
    if (!selectedItem.workspaceId) return;
  
    try {
      const response = await fetch("/api/pinned", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedItem.workspaceId,
          boardId: selectedItem.boardId || undefined,
        }),
      });
  
      if (response.ok) {
        const newItem = await response.json();
        setPinnedItems([...pinnedItems, newItem]);
        toast.success("Workspace or board pinned successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to pin item");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };
  

  const handleCardClick = (item: PinnedItem) => {
    if (item.type === "workspace") {
      router.push(`/dashboard/${item.workspaceId}/boards`);
    } else if (item.type === "board") {
      router.push(`/dashboard/${item.workspaceId}/boards/${item.id}`);
    }
  };
  

  return (
    <div className="pinned-section mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        Pinned workspaces and boards
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
          <PopoverContent align="start" className="w-64 p-2">
            <ul className="space-y-1">
              {workspaces.map((workspace) => (
                <li key={workspace.id}>
                  <div
                    onMouseEnter={() => handleWorkspaceHover(workspace.id)}
                    onClick={() => setSelectedItem({ workspaceId: workspace.id, boardId: null })}
                    className={cn(
                      "block w-full text-left px-4 py-2 rounded-md transition-colors duration-200",
                      selectedItem.workspaceId === workspace.id && !selectedItem.boardId
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                    )}
                  >
                    {workspace.name}
                  </div>
                  {hoveredWorkspaceId === workspace.id && boardsByWorkspace[workspace.id] && (
                    <ul className="pl-4 mt-2 space-y-1">
                      {boardsByWorkspace[workspace.id].map(board => (
                        <li key={board.id}>
                          <Button
                            onClick={() => setSelectedItem({ workspaceId: workspace.id, boardId: board.id })}
                            className={cn(
                              "block w-full text-left px-4 py-2 rounded-md transition-colors duration-200",
                              selectedItem.boardId === board.id
                                ? "bg-gray-800 text-white"
                                : "bg-gray-50 hover:bg-gray-100"
                            )}
                          >
                            {board.title}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <Button
              onClick={handlePinWorkspaceOrBoard}
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
                      className="min-w-[250px] cursor-pointer"
                      onClick={() => handleCardClick(item)} 
                    >
                      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out relative">
                        <CardHeader className="pb-2 flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                            {item.workspaceName && (
                              <CardDescription className="text-sm text-gray-500">
                                {item.workspaceName}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className="text-gray-600 hover:text-black"
                                  onClick={(e) => e.stopPropagation()} 
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                  </svg>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="p-2 w-auto text-sm">
                                <Button
                                  onClick={(e) => handleUnpin(item.id, e)}
                                  variant="destructive"
                                  className="w-full text-xs py-1 px-2"
                                >
                                  Unpin
                                </Button>
                              </PopoverContent>
                            </Popover>
                            <button
                              {...provided.dragHandleProps}
                              className="text-gray-600 hover:text-black cursor-grab"
                              onClick={(e) => e.stopPropagation()} 
                            >
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
                                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                              </svg>
                            </button>
                          </div>
                        </CardHeader>
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
