"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home'; 
import { useEffect } from 'react';
import { JsonArray } from '@prisma/client/runtime/react-native.js';


export default function MainPage() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    void bruh();
  }, []);

  if (!isSignedIn) {
    return <Landing />;
  }

  return <Home />;
}

interface Post {
  id: number;
  name: string;
  createdAt: string; // ISO string representation of DateTime
  updatedAt: string; // ISO string representation of DateTime
}

interface GetAllResponse {
  result: {
    data: {
      json: Post[];
    };
  };
}

async function bruh() {
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

    const data: GetAllResponse = await response.json() as GetAllResponse;
    console.log(data.result.data.json[0]?.id);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
