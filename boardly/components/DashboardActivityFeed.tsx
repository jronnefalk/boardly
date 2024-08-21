import React, { useEffect, useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { ActivityWithUser } from '@/lib/types';

const DashboardActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await fetch('/api/workspaces/recent-activity');
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <ul>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity.id} data={activity} />
          ))
        ) : (
          <p>No recent activities found.</p>
        )}
      </ul>
    </div>
  );
};

export default DashboardActivityFeed;
