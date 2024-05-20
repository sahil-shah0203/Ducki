'use client';

import Link from 'next/link';
import { useState } from 'react';
import AddClassDialog from './AddClassDialog';

export default function Sidebar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);

  const handleAddClass = (className: string) => {
    setClasses([...classes, className]);
    // Add logic to persist the class in the database if needed
  };

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 h-full">
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
