'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ActivityList } from '@/components/ActivityList';
import { ActivityWithUser } from '@/lib/types';

const ActivityPage = () => {
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
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
      }
    };

    fetchActivities();  
  }, [workspaceId]); 

  return (
    <div className="p-4">
      <ActivityList items={activities} />
    </div>
  );
};

export default ActivityPage;
