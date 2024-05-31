"use client";

import { useState } from 'react';
import Calendar from './_components/Calendar';
import ToDoList from './_components/ToDoList';
import { api } from "~/trpc/react";

import { useEffect } from 'react';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [postName, setPostName] = useState<string>('');
  const [fetchPost, setFetchPost] = useState(false);

  const createPostMutation = api.post.create.useMutation({
    onSuccess: (data) => {
      console.log('Post created:', data);
    },
    onError: (error) => {
      console.error('Error creating post:', error);
    }
  });

  const { data: latestPost, error, isLoading } = api.post.getLatest.useQuery(
    undefined, // No parameters for getLatest query
    {
      enabled: fetchPost, // Only fetch when fetchPost is true
      onSuccess: () => setFetchPost(false), // Reset fetchPost after fetching
    }
  );

  // Use useEffect to log the latest post when it changes
  useEffect(() => {
    if (latestPost) {
      console.log('Latest post:', latestPost);
    }
  }, [latestPost]);

  const fetchLatestPost = () => {
    setFetchPost(true);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate({ name: postName });
  };

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-8">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Upload to Brainwave</div>
          <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={fetchLatestPost}>
            Ignore for now but can be feature
          </button>
        </div>
        <div className="mt-8">
          <h2 className="font-bold">Manual</h2>
          <div className="border mt-2 p-4">
            <form onSubmit={handleCreatePost}>
              <input
                type="text"
                className="border rounded py-1 px-2"
                placeholder="Enter post name"
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
              />
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded ml-2"
                disabled={createPostMutation.isLoading}
              >
                {createPostMutation.isLoading ? 'Creating...' : 'Add Concept'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="flex-1 bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <span>Calendar?</span>
            <input
              type="date"
              className="border rounded py-1 px-2"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="mt-4">
            {selectedDate ? `Selected Date: ${selectedDate}` : "No date selected"}
          </div>
          {isLoading && <p>Loading latest post...</p>}
          {error && <p>Error fetching latest post: {error.message}</p>}
          {latestPost && (
            <div className="mt-4">
              <h3 className="font-bold">Latest Post:</h3>
              <pre>{JSON.stringify(latestPost, null, 2)}</pre>
            </div>
          )}
        </div>
        <aside className="w-64 bg-white p-4 border-l">
          <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <ToDoList />
        </aside>
      </div>
    </div>
  );
}
