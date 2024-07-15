"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AddClassDialog from "./AddClassDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import ProfileDropdown from "./ProfileDropdown";
import { api } from "~/trpc/react";
import {
  FaEllipsisV,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { SignOutButton } from "@clerk/nextjs";
import DashboardButton from "~/app/_components/sidebar_components/DashboardButton";
import CalendarButton from "~/app/_components/sidebar_components/CalendarButton";

type SidebarProps = {
  userId: number | undefined;
  handleClassSelect: (
    selectedClass: { class_id: number; class_name: string } | null,
  ) => void;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  userImage: string | undefined;
};

type ClassItem = {
  class_id: number;
  class_name: string;
};

export default function Sidebar({
  userId,
  handleClassSelect,
  toggleSidebar,
  isCollapsed,
  userImage,
}: SidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>(
    {},
  );
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { mutateAsync: addClassMutation } = api.class.addClass.useMutation();
  const { mutateAsync: removeClassMutation } =
    api.class.removeClass.useMutation();

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

  const handleClassClick = (classItem: ClassItem) => {
    handleClassSelect(classItem);
    setSelectedClass(classItem);
  };

  const handleRemoveClass = async () => {
    if (userId && classToDelete) {
      try {
        const deleteClass = await removeClassMutation({
          user_id: userId,
          class_id: classToDelete?.class_id,
        });
        console.log("Deleted class:", deleteClass);
        setClasses(
          classes.filter(
            (classItem) => classItem.class_id !== classToDelete?.class_id,
          ),
        );
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading classes</div>;

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${isCollapsed ? "w-16" : "w-64"} transition-width overflow-y-auto overflow-x-hidden bg-transparent p-4 text-white duration-300`}
    >
      <div className="absolute top-0 left-1 w-full p-4 flex items-center space-x-4"
           style={{paddingLeft: isCollapsed ? '12px' : ''}}>
        <img src="public/duck.png" alt="Ducki" className="w-7 h-7 rounded-full cursor-pointer"/>
        {!isCollapsed && <h1 className="text-2xl font-bold cursor-pointer" >Ducki</h1>}
      </div>
      <div
        className="absolute left-0 top-0 flex w-full items-center space-x-4 p-4"
        style={{paddingLeft: isCollapsed ? "12px" : ""}}
      >
        <div className="h-8 w-8 rounded-full bg-gray-500"></div>
        {!isCollapsed && <h1 className="text-2xl font-bold">Ducki</h1>}
      </div>
      {!isCollapsed && (
        <>
          <nav className="mt-16 space-y-4">
            <DashboardButton/>
            <CalendarButton/>
          </nav>
          <div className="mb-4 mt-16 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Classes</h1>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="group flex h-10 w-10 select-none items-center justify-center rounded-lg border border-zinc-100 bg-white leading-8 text-zinc-950 shadow-[0_-1px_0_0px_#d4d4d8_inset,0_0_0_1px_#f4f4f5_inset,0_0.5px_0_1.5px_#fff_inset] hover:bg-zinc-50 hover:via-zinc-900 hover:to-zinc-800 focus:outline-none active:shadow-[-1px_0px_1px_0px_#e4e4e7_inset,1px_0px_1px_0px_#e4e4e7_inset,0px_0.125rem_1px_0px_#d4d4d8_inset]"
              aria-label="Add"
            >
              <span className="flex items-center group-active:[transform:translate3d(0,1px,0)]">
                <FaPlus className="h-4 w-4" style={{color: "#217853"}}/>
              </span>
            </button>
          </div>
          <nav>
            <div className="space-y-0">
              {classes.map((classItem, index) => (
                <div
                  key={index}
                  className={`relative ${classItem.class_name === selectedClass?.class_name ? "rounded-lg bg-[#217853]" : ""}`}
                >
                  <button
                    onClick={() => handleClassClick(classItem)}
                    className="flex w-full items-center justify-between rounded-lg bg-transparent p-1 pl-3 text-left hover:bg-[#217853]"
                  >
                    {isCollapsed ? "" : classItem.class_name}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropdownOpen((prevState) => ({
                            ...prevState,
                            [classItem.class_name]:
                              !prevState[classItem.class_name],
                          }));
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-500 focus:outline-none"
                      >
                        <FaEllipsisV/>
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
                </div>
              ))}
            </div>
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
        {isCollapsed ? <FaChevronRight/> : <FaChevronLeft/>}
      </button>
      {!isCollapsed && <ProfileDropdown userImage={userImage}/>}
    </aside>
  );
}
