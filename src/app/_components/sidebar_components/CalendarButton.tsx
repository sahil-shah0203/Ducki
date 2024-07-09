'use client';

import Link from 'next/link';
import { FaRegCalendarAlt } from 'react-icons/fa';

type CalendarButtonProps = {
  isSelected: boolean;
  onClick: () => void;
};

const CalendarButton = ({ isSelected, onClick }: CalendarButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 text-white text-lg rounded-lg cursor-pointer transition-colors duration-300 ${isSelected ? "bg-[#217853]" : "hover:bg-[#217853]"}`}
    >
      <Link href="/calendar" passHref>
        <div className="flex items-center">
          <FaRegCalendarAlt className="mr-2" size={24} />
          <span>Calendar</span>
        </div>
      </Link>
    </div>
  );
}

export default CalendarButton;
