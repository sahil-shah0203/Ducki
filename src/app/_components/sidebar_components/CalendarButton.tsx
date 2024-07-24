"use client";
import { FaCalendar } from "react-icons/fa";

type CalendarButtonProps = {
  onClick: () => void;
};

const CalendarButton: React.FC<CalendarButtonProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick} // Attach the onClick handler
      className="flex cursor-pointer items-center rounded-lg p-4 text-lg text-white transition-colors duration-300"
    >
      <div className="flex items-center">
        <FaCalendar className="mr-2" size={24} />
        <span>Calendar</span>
      </div>
    </div>
  );
};

export default CalendarButton;
