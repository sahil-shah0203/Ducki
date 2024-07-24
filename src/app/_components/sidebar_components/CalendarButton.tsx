import { FaCalendar } from 'react-icons/fa';

const CalendarButton = () => {
  return (
    <div
      className={`flex items-center p-4 text-white text-lg rounded-lg cursor-pointer transition-colors duration-300 `}
    >
      <div className="flex items-center">
        <FaCalendar className="mr-2" size={24} />
        <span>Calendar</span>
      </div>
    </div>
  );
}

export default CalendarButton;