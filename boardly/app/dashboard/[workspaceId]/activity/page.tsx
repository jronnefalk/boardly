'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ActivityList } from '@/components/ActivityList';
import { ActivityWithUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const ActivityPage = () => {
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams() as { workspaceId: string }; 
  const { workspaceId } = params;

  useEffect(() => {
    const fetchActivities = async () => {
      if (!workspaceId) return;

      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/activity`);
        const data: ActivityWithUser[] = await response.json();

        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();  
  }, [workspaceId]); 

  return (
    <div className="p-4 ml-4"> 
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : (
        <ActivityList items={activities} />
      )}
    </div>
  );
};

export default ActivityPage;
