'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import AddClassDialog from './AddClassDialog';
import { api } from "~/trpc/react";
import { FaEllipsisV, FaPlus } from 'react-icons/fa';

interface HomeProps {
  userId: number | undefined;
  handleClassSelect: (selectedClass: string) => void;
}

export default function Sidebar({ userId, handleClassSelect }: HomeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>({});
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handleClassClick = (className: string) => {
    handleClassSelect(className);
    setSelectedClass(className);
  };
  const { mutateAsync: addClassMutation } = api.class.addClass.useMutation();
  const { mutateAsync: removeClassMutation } = api.class.removeClass.useMutation();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRefs.current) {
        let isClickOutside = true;
        Object.values(dropdownRefs.current).forEach(ref => {
          if (ref?.contains(event.target as Node)) {
            isClickOutside = false;
          }
        });

        if (isClickOutside) {
          setIsDropdownOpen({});
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRefs]);

  const handleRemoveClass = async () => {
    if (classToDelete && userId) {
      try {
        await removeClassMutation({
          user_id: userId,
          class_name: classToDelete,
        });
        console.log("Removed class:", classToDelete);

        setClasses(classes.filter(className => className !== classToDelete));
        handleClassSelect('');
      } catch (error) {
        console.error("Error removing class:", error);
      }
      setClassToDelete(null);
    }
  };

  const handleAddClass = (classTemp: string): boolean => {
    const className = classTemp.trim();
    setClasses([...classes, className]);

    if (userId) {
      try {
        addClassMutation({
          user_id: userId,
          class_name: className,
        }).then((newClass) => {
          console.log("Added new class:", newClass);
        });
      } catch (error) {
        console.error("Error adding class:", error);
      }
    }
    return true;
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Classes</h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center focus:outline-none"
        >
          <FaPlus className="text-white"/>
        </button>
      </div>
      <nav>
        <ul className="space-y-0">
          {classes.map((className, index) => (
            <li key={index} className={`relative ${className === selectedClass ? 'highlighted' : ''}`}>
              <button
                onClick={() => handleClassClick(className)} // Call handleClassClick when a class is clicked
                className="w-full text-left p-4 bg-transparent hover:bg-gray-600 flex justify-between items-center"
              >
                {className}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stop the propagation of the click event
                      setIsDropdownOpen(prevState => ({
                        ...prevState,
                        [className]: !prevState[className],
                      }));
                    }}
                    className="focus:outline-none hover:bg-gray-500 rounded-full w-10 h-10 flex items-center justify-center" // Add rounded-full, w-10, h-10, flex, items-center, justify-center
                  >
                    <FaEllipsisV/>
                  </button>
                  {isDropdownOpen[className] && (
                    <div
                      ref={(ref) => {
                        dropdownRefs.current[className] = ref;
                      }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10"
                    >
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setClassToDelete(className);
                          setIsDropdownOpen({});
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white"
                      >
                        Delete Class
                      </a>
                    </div>
                  )}
                </div>
              </button>
            </li>
          ))}
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
      <AddClassDialog
        isOpen={isDialogOpen}
        onRequestClose={() => setIsDialogOpen(false)}
        onAddClass={handleAddClass}
        classes={classes} // Pass the classes array as a prop
      />
      {classToDelete && (
        <ConfirmDeleteDialog
          className={classToDelete}
          onCancel={() => setClassToDelete(null)}
          onConfirm={handleRemoveClass}
        />
      )}
    </aside>
  );
}

interface ConfirmDeleteDialogProps {
  className: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteDialog({ className, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md shadow-md">
        <h2 className="text-xl mb-4 text-black">Are you sure you want to delete &quot;{className}&quot;?</h2>
        <div className="flex justify-end">
          <button onClick={onCancel} className="mr-4 px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
