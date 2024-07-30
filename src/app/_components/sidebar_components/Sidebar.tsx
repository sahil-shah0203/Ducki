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
import DashboardButton from "~/app/_components/sidebar_components/DashboardButton";
import CalendarButton from "~/app/_components/sidebar_components/CalendarButton";

import { useRouter } from "next/navigation";

type SidebarProps = {
  userId: number | undefined;
  handleClassSelect: (
    selectedClass: { class_id: number; class_name: string } | null,
  ) => void;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  userImage: string | undefined;
  onFetchResults: (choices: any[]) => void;
  onError: (error: string | null) => void;
  user_id: number | undefined;
  selectedClassName: string | undefined;
  selectedClassID: number | undefined;
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
  onFetchResults,
  onError,
  user_id,
  selectedClassName,
  selectedClassID,
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

  const router = useRouter();

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
    const url = `/classes/${classItem.class_id}?user=${user_id}&className=${classItem.class_name}&classID=${classItem.class_id}`;
    router.push(url);
  };

  const resetSelectedClass = () => {
    setSelectedClass(null);
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

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }
  if (error) return <div>Error loading classes</div>;

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${isCollapsed ? "w-16" : "w-64"} transition-width overflow-y-auto overflow-x-hidden bg-transparent p-4 text-white duration-300`}
    >
      <div
        className="absolute left-1 top-0 flex w-full items-center space-x-4 p-4"
        style={{ paddingLeft: isCollapsed ? "12px" : "" }}
      >
        <Link href="/">
          <img
            onClick={resetSelectedClass}
            src="\duck.png"
            alt="Ducki"
            className="h-7 w-7 cursor-pointer rounded-full"
          />
        </Link>
        {!isCollapsed && (
          <Link href="/">
            <h1
              onClick={resetSelectedClass}
              className="cursor-pointer text-2xl font-bold"
            >
              ducki
            </h1>
          </Link>
        )}
      </div>
      {!isCollapsed && (
        <>
          <nav className="mt-16 space-y-4">
            <Link href="/dashboard">
              <DashboardButton onClick={resetSelectedClass} />
            </Link>
            <Link href="/dashboard">
              <CalendarButton onClick={resetSelectedClass} />
            </Link>
          </nav>
          <div className="mb-4 mt-16 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Sections</h1>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-white hover:text-gray-300 focus:outline-none"
              aria-label="Add"
            >
              <span className="flex items-center group-active:[transform:translate3d(0,1px,0)]">
                <FaPlus className="h-4 w-4" style={{ color: "white" }} />
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
                  <a
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
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-transparent focus:outline-none"
                      >
                        <FaEllipsisV />
                      </button>
                      {isDropdownOpen[classItem.class_name] && (
                        <div
                          ref={(ref) => {
                            dropdownRefs.current[classItem.class_name] = ref;
                          }}
                          className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-xl"
                        >
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              // Function to show all uploaded files from S3 (another API)
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-400 hover:text-white"
                          >
                            See Files
                          </a>
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
                  </a>
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
        className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-transparent focus:outline-none"
      >
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>
      {!isCollapsed && (
        <ProfileDropdown userImage={userImage} userId={userId} />
      )}
    </aside>
  );
}
