'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import DashboardActivityFeed from '@/components/DashboardActivityFeed';
import { PinnedSection } from './PinnedSection';
import { Skeleton } from '@/components/ui/skeleton';

const textFont = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

interface Workspace {
  id: string;
  name: string;
  users: {
    id: string;
    role: string;
    user: {
      id: string;
      email: string;
    };
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedWorkspaceId = searchParams?.get('workspaceId') ?? '';
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(selectedWorkspaceId);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch('/api/userinfo');
        const { isAuthenticated, user } = await response.json();

        if (isAuthenticated && user) {
          const userWorkspaces = user.workspaces ?? [];
          setWorkspaces(userWorkspaces);
          setUserName(user.given_name || user.email || 'User');
          setCurrentWorkspaceId(userWorkspaces[0]?.id ?? '');
        } else {
          setErrorMessage('User not authenticated');
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        setErrorMessage('Failed to fetch user info');
      } finally {
        setLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good morning';
    } else if (currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-8 max-w-screen-xl mx-auto">
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md flex justify-between items-center">
          <div>
            <h1 className={cn('text-4xl font-bold mb-2', textFont.className)}>
              {loading ? <Skeleton className="w-[300px] h-[40px] rounded" /> : `${getGreeting()}, ${userName}!`}
            </h1>
            <div className="text-gray-600">
              {loading ? <Skeleton className="w-[250px] h-[20px] rounded" /> : 'Manage your tasks and projects efficiently.'}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="h-44 w-44">
              {loading ? (
                <Skeleton className="w-full h-full rounded" />
              ) : (
                <img src="dashboard-illustration.svg" alt="Dashboard Illustration" className="h-full w-full" />
              )}
            </div>
          </div>
        </div>

        <PinnedSection />
        <DashboardActivityFeed />

        {errorMessage && <div className="mt-4 text-red-600">{errorMessage}</div>}
      </div>
    </div>
  );
}
