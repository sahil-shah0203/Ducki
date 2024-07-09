'use client';

import Link from 'next/link';
import { FaRegCalendarAlt } from 'react-icons/fa';

const CalendarButton = () => {
  return (
    <Link href="/calendar" passHref>
      <div className="flex items-center p-4 text-white text-lg bg-transparent rounded-lg hover:bg-[#217853] cursor-pointer">
        <FaRegCalendarAlt className="mr-2" size={24} />
        <span>Calendar</span>
      </div>
    </Link>
  );
}

export default CalendarButton;
