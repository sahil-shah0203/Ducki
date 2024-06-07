'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import AddClassDialog from './AddClassDialog';
import { api } from "~/trpc/react";
import { FaCog } from 'react-icons/fa'; // Import the settings icon from react-icons

interface HomeProps {
  userId: number | undefined;
}

export default function Sidebar({ userId }: HomeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { mutateAsync: addClassMutation } = api.class.addClass.useMutation();
  const [isRemoveClassesDialogOpen, setIsRemoveClassesDialogOpen] = useState(false);
  const [classesToRemove, setClassesToRemove] = useState<string[]>([]);
  const { mutateAsync: removeClassMutation } = api.class.removeClass.useMutation();

  const handleRemoveClasses = async () => {
    for (const className of classesToRemove) {
      if (userId) {
        try {
          await removeClassMutation({
            user_id: userId,
            class_name: className,
          });
          console.log("Removed class:", className);
        } catch (error) {
          console.error("Error removing class:", error);
        }
      }
    }
    setClasses(classes.filter(className => !classesToRemove.includes(className)));
    setClassesToRemove([]);
    setIsRemoveClassesDialogOpen(false);
  };

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Classes</h1>
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="focus:outline-none">
            <FaCog size={20}/>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRemoveClassesDialogOpen(true);
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white"
              >
                Remove Classes
              </a>
            </div>
          )}
        </div>
      </div>
      <nav>
        <select className="w-full mt-4 bg-white text-black">
          {classes.map((className, index) => (
            <option key={index} value={className}>
              {className}
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="hover:underline mt-2"
        >
          New Class
        </button>
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
      <AddClassDialog
        isOpen={isDialogOpen}
        onRequestClose={() => setIsDialogOpen(false)}
        onAddClass={handleAddClass}
      />
      <RemoveClassesDialog
        isOpen={isRemoveClassesDialogOpen}
        onRequestClose={() => setIsRemoveClassesDialogOpen(false)}
        classes={classes}
        classesToRemove={classesToRemove}
        onRemoveClasses={handleRemoveClasses}
        onToggleClassToRemove={(className: string) => {
          setClassesToRemove(prevClasses =>
            prevClasses.includes(className)
              ? prevClasses.filter(name => name !== className)
              : [...prevClasses, className]
          );
        }}
      />
    </aside>
  );
}

interface RemoveClassesDialogProps {
  isOpen: boolean;
  onRequestClose: () => void;
  classes: string[];
  classesToRemove: string[];
  onRemoveClasses: () => void;
  onToggleClassToRemove: (className: string) => void;
}

function RemoveClassesDialog({
  isOpen,
  onRequestClose,
  classes,
  classesToRemove,
  onRemoveClasses,
  onToggleClassToRemove,
}: RemoveClassesDialogProps) {
  return (
    <dialog open={isOpen} onClose={onRequestClose}>
      <h2>Remove Classes</h2>
      <ul>
        {classes.map(className => (
          <li key={className}>
            <input
              type="checkbox"
              checked={classesToRemove.includes(className)}
              onChange={() => onToggleClassToRemove(className)}
            />
            {className}
          </li>
        ))}
      </ul>
      <button onClick={onRemoveClasses}>Remove</button>
      <button onClick={onRequestClose}>Cancel</button>
    </dialog>
  );
}
