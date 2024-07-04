"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AddClassDialog from "./AddClassDialog";
import { api } from "~/trpc/react";
import { FaEllipsisV, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import HomeBackground from '~/app/HomeBackground'; // Import Background component

type SidebarProps = {
  userId: number | undefined;
  handleClassSelect: (selectedClass: { class_id: number; class_name: string } | null) => void;
  toggleSidebar: () => void;
  isCollapsed: boolean;
};

type ClassItem = {
  class_id: number;
  class_name: string;
};

export default function Sidebar({ userId, handleClassSelect, toggleSidebar, isCollapsed }: SidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>({});
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handleClassClick = (classItem: ClassItem) => {
    handleClassSelect(classItem);
    setSelectedClass(classItem);
  };
  const { mutateAsync: addClassMutation } = api.class.addClass.useMutation();
  const { mutateAsync: removeClassMutation } = api.class.removeClass.useMutation();
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRefs.current) {
        let isClickOutside = true;
        Object.values(dropdownRefs.current).forEach((ref) => {
          if (ref?.contains(event.target as Node)) {
            isClickOutside = false;
          }
        });

        if (isClickOutside) {
          setIsDropdownOpen({});
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRefs]);

  const handleRemoveClass = async () => {
    if (userId && classToDelete) {
      try {
        const deleteClass = await removeClassMutation({
          user_id: userId,
          class_id: classToDelete?.class_id,
        });
        console.log("Deleted class:", deleteClass);
        setClasses(classes.filter((classItem) => classItem.class_id !== classToDelete?.class_id));
      } catch (error) {
        console.error("Error deleting class:", error);
      }

      handleClassSelect(null);
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
        setClasses((prevClasses) => [...prevClasses, newClass]);
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
    },
  );

  useEffect(() => {
    if (data) {
      setClasses(data);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading classes</div>;

  return (
    <>
      <HomeBackground isCollapsed={isCollapsed} />
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${isCollapsed ? 'w-16' : 'w-64'} overflow-y-auto p-4 text-white bg-transparent transition-width duration-300`}>
        {!isCollapsed && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h1 className={`text-2xl font-bold ${isCollapsed ? 'hidden' : 'block'}`}>Classes</h1>
              <button
                onClick={() => setIsDialogOpen(true)}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 focus:outline-none ${isCollapsed ? 'mx-auto' : ''}`}
              >
                <FaPlus className="text-white" />
              </button>
            </div>
            <nav>
              <ul className="space-y-0">
                {classes.map((classItem, index) => (
                  <li
                    key={index}
                    className={`relative ${classItem.class_name === selectedClass?.class_name ? "bg-[#217853] rounded-lg" : ""}`}
                  >
                    <button
                      onClick={() => handleClassClick(classItem)}
                      className="flex w-full items-center justify-between bg-transparent p-1 pl-3 text-left hover:bg-[#217853] rounded-lg"
                    >
                      {isCollapsed ? '' : classItem.class_name}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Stop the propagation of the click event
                            setIsDropdownOpen((prevState) => ({
                              ...prevState,
                              [classItem.class_name]: !prevState[classItem.class_name],
                            }));
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-500 focus:outline-none"
                        >
                          <FaEllipsisV />
                        </button>
                        {isDropdownOpen[classItem.class_name] && (
                          <div
                            ref={(ref) => {
                              dropdownRefs.current[classItem.class_name] = ref;
                            }}
                            className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-md bg-white shadow-xl"
                          >
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setClassToDelete(classItem);
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
            <AddClassDialog
              isOpen={isDialogOpen}
              onRequestClose={() => setIsDialogOpen(false)}
              onAddClass={handleAddClass}
              classes={classes}
            />
            {classToDelete && (
              <ConfirmDeleteDialog
                className={classToDelete.class_name}
                onCancel={() => setClassToDelete(null)}
                onConfirm={handleRemoveClass}
              />
            )}
          </>
        )}
        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 focus:outline-none"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </aside>
    </>
  );
}

interface ConfirmDeleteDialogProps {
  className: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteDialog({
                               className,
                               onCancel,
                               onConfirm,
                             }: ConfirmDeleteDialogProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-md bg-white p-4 shadow-md">
        <h2 className="mb-4 text-xl text-black">
          Are you sure you want to delete &quot;{className}&quot;?
        </h2>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="mr-4 rounded bg-gray-200 px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-500 px-4 py-2 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
