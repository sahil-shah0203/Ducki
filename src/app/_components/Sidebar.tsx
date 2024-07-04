"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AddClassDialog from "./AddClassDialog";
import { api } from "~/trpc/react";
import { FaEllipsisV, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { SignOutButton } from '@clerk/nextjs'; // Import SignOutButton

type SidebarProps = {
  userId: number | undefined;
  handleClassSelect: (selectedClass: { class_id: number; class_name: string } | null) => void;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  userImage: string | undefined; // Add userImage prop to SidebarProps
};

type ClassItem = {
  class_id: number;
  class_name: string;
};

export default function Sidebar({ userId, handleClassSelect, toggleSidebar, isCollapsed, userImage }: SidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>({});
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // State for profile dropdown
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const profileDropdownRef = useRef<HTMLDivElement | null>(null); // Ref for profile dropdown
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

        if (profileDropdownRef.current?.contains(event.target as Node)) {
          isClickOutside = false;
        }

        if (isClickOutside) {
          setIsDropdownOpen({});
          setIsProfileDropdownOpen(false); // Close profile dropdown if clicked outside
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRefs, profileDropdownRef]);

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

  const handleProfileSettings = () => {
    // Add navigation logic for profile settings here
  };

  const handleHomeNavigation = () => {
    // Add navigation logic for home page here
  };

  return (
    <aside className={`fixed left-0 top-0 h-full ${isCollapsed ? 'w-16' : 'w-64'} overflow-y-auto overflow-x-hidden p-4 text-white bg-transparent transition-width duration-300`}>
      <div className="absolute top-0 left-0 w-full p-4 flex items-center space-x-4" style={{ paddingLeft: isCollapsed ? '12px' : '' }}>
        {/* Placeholder for logo */}
        <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
        {!isCollapsed && <h1 className="text-2xl font-bold">Ducki</h1>}
      </div>
      {!isCollapsed && (
        <>
          <div className="mt-16 mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Classes</h1>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="group flex h-10 w-10 select-none items-center justify-center rounded-lg border border-zinc-100 bg-white leading-8 text-zinc-950 shadow-[0_-1px_0_0px_#d4d4d8_inset,0_0_0_1px_#f4f4f5_inset,0_0.5px_0_1.5px_#fff_inset] hover:bg-zinc-50 hover:via-zinc-900 hover:to-zinc-800 active:shadow-[-1px_0px_1px_0px_#e4e4e7_inset,1px_0px_1px_0px_#e4e4e7_inset,0px_0.125rem_1px_0px_#d4d4d8_inset] focus:outline-none"
              aria-label="Add"
            >
              <span className="flex items-center group-active:[transform:translate3d(0,1px,0)]">
                <FaPlus className="h-4 w-4" style={{ color: '#217853' }} />
              </span>
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
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 flex items-center">
          <img
            src={userImage}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} // Toggle profile dropdown
          />
          {isProfileDropdownOpen && (
            <div
              ref={profileDropdownRef}
              className="absolute left-0 bottom-12 w-48 bg-white rounded-md overflow-hidden shadow-xl z-20" // Adjust the position here
            >
              <button
                onClick={handleProfileSettings}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
              >
                My Profile
              </button>
              <button
                onClick={handleProfileSettings}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
              >
                Settings
              </button>
              <button
                onClick={handleHomeNavigation}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full text-left"
              >
                Home
              </button>
              <SignOutButton>
                <button className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-200 w-full text-left">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      )}
    </aside>
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
