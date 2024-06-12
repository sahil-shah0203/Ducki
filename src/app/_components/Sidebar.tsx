'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import AddClassDialog from './AddClassDialog';
import { api } from "~/trpc/react";
import { FaEllipsisV, FaPlus } from 'react-icons/fa';

type SidebarProps = {
  userId: number | undefined;
  handleClassSelect: (selectedClass: { class_id: number, class_name: string } | null) => void;
};

export default function Sidebar({ userId, handleClassSelect }: SidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classes, setClasses] = useState<{ class_id: number, class_name: string }[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>({});
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handleClassClick = (classItem: { class_id: number, class_name: string }) => {
    handleClassSelect(classItem);
    setSelectedClass(classItem);
  };
  const { mutateAsync: addClassMutation } = api.class.addClass.useMutation();
  const { mutateAsync: removeClassMutation } = api.class.removeClass.useMutation();
  const [selectedClass, setSelectedClass] = useState<{ class_id: number, class_name: string } | null>(null);
  const { mutateAsync: removeChatHistoryMutation } = api.chats.removeChatHistory.useMutation();

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
      // Find the class to delete
      const classToRemove = classes.find(classItem => classItem.class_name === classToDelete);

      if (classToRemove) {
        try {
          // Fetch the chat histories associated with this class
          const chatHistoriesResult = api.chats.getChatHistoryByClassId.useQuery({ class_id: classToRemove.class_id });

          if (chatHistoriesResult.data) {
            // Iterate over each chat history and delete it
            for (const chatHistory of chatHistoriesResult.data) {
              if (chatHistory.chat_id !== undefined) {
                try {
                  await removeChatHistoryMutation({ chat_id: chatHistory.chat_id });
                } catch (error) {
                  console.error("Error removing chat history:", error);
                }
              }
            }
          }

          // Now you can delete the class
          await removeClassMutation({
            user_id: userId,
            class_id: classToRemove.class_id,
          });
          console.log("Removed class:", classToRemove);

          setClasses(classes.filter(classItem => classItem.class_name !== classToDelete));
          handleClassSelect(null);
        } catch (error) {
          console.error("Error removing class:", error);
        }
      }

      setClassToDelete(null);
    }
  };

  const handleAddClass = async (classTemp: string): Promise<boolean> => {
    const className = classTemp.trim();

    if (userId) {
      try {
        const newClass = await addClassMutation({
          user_id: userId,
          class_name: className,
        });
        console.log("Added new class:", newClass);
        setClasses(prevClasses => [...prevClasses, newClass]);
        return true;
      } catch (error) {
        console.error("Error adding class:", error);
      }
    }
    return false;
  };

  const { data, error, isLoading } = api.class.getClassesByUserId.useQuery(
    { user_id: userId! },
    {
      enabled: !!userId, 
    }
  );

  useEffect(() => {
    if (data) {
      setClasses(data);
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
          {classes.map((classItem, index) => (
            <li key={index} className={`relative ${classItem.class_name === selectedClass?.class_name ? 'highlighted' : ''}`}>
              <button
                onClick={() => handleClassClick(classItem)}
                className="w-full text-left p-4 bg-transparent hover:bg-gray-600 flex justify-between items-center"
              >
                {classItem.class_name}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stop the propagation of the click event
                      setIsDropdownOpen(prevState => ({
                        ...prevState,
                        [classItem.class_name]: !prevState[classItem.class_name],
                      }));
                    }}
                    className="focus:outline-none hover:bg-gray-500 rounded-full w-10 h-10 flex items-center justify-center" // Add rounded-full, w-10, h-10, flex, items-center, justify-center
                  >
                    <FaEllipsisV/>
                  </button>
                  {isDropdownOpen[classItem.class_name] && (
                    <div
                      ref={(ref) => {
                        dropdownRefs.current[classItem.class_name] = ref;
                      }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10"
                    >
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setClassToDelete(classItem.class_name);
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
