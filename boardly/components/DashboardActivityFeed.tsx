import React, { useEffect, useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { ActivityWithUser } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';

const DashboardActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await fetch('/api/workspaces/recent-activity');
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <ScrollArea className="h-72">
        <ul>
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-[20px] rounded-md mb-2" />
            ))
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityItem key={activity.id} data={activity} />
            ))
          ) : (
            <p>No recent activities found.</p>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
};


export default DashboardActivityFeed;
