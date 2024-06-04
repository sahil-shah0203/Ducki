'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import AddClassDialog from './AddClassDialog';
import { api } from "~/trpc/react";

interface HomeProps {
  userId: number | undefined;
}

export default function Sidebar({ userId }: HomeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);

  const { mutateAsync: addClassMutation } = api.class.addClass.useMutation();

  const handleAddClass = async (classTemp: string) => {
    const className = classTemp.trim();
    setClasses([...classes, className]);

    // Call function to add class to the database
    if (userId) {
      try {
        const newClass = await addClassMutation({
          user_id: userId,
          class_name: className,
        });
        console.log("Added new class:", newClass);
      } catch (error) {
        console.error("Error adding class:", error);
      }
    }
  };

  const { data, error, isLoading } = api.class.getClassesByUserId.useQuery(
    { user_id: userId! },
    {
      enabled: !!userId, 
    }
  );

  useEffect(() => {
    if (data) {
      setClasses(data.map((classItem) => classItem.class_name));
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading classes</div>;

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-800 text-white p-4 overflow-y-auto">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Classes</h1>
        <nav>
          <ul>
            {classes.map((className, index) => (
              <li key={index} className="py-2 pl-4">
                <Link href="#" className="hover:underline">
                  {className}
                </Link>
              </li>
            ))}
            <li className="py-2">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="hover:underline"
              >
                New Class
              </button>
            </li>
          </ul>
        </nav>
        <footer>
          <div className="py-2">
            <Link href="#" className="hover:underline">
              Archived
            </Link>
          </div>
          <div className="py-2 text-orange-400">
            <Link href="#" className="hover:underline">
              Fall 2022
            </Link>
          </div>
        </footer>
      </div>
      <AddClassDialog
        isOpen={isDialogOpen}
        onRequestClose={() => setIsDialogOpen(false)}
        onAddClass={handleAddClass}
      />
    </aside>
  );
}
