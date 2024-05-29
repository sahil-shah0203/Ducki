"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home'; 
import { useEffect } from 'react';
import Sidebar from './_components/Sidebar';

export default function MainPage() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    fetchPosts();
  }, []);

  if (!isSignedIn) {
    return <Landing />;
  }

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar /> 
      <div className="flex-1 ml-64 p-4 flex flex-col h-full justify-end">
        <Home />
      </div>
    </div>
  );
}

interface Post {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface GetAllResponse {
  result: {
    data: {
      json: Post[];
    };
  };
}

async function fetchPosts() {
  try {
    const response = await fetch('/api/trpc/post.getAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch:', response.statusText);
      return;
    }

    const data: GetAllResponse = await response.json();
    console.log(data.result.data.json[0]?.id);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
