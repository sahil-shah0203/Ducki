'use client';

import Link from 'next/link';
import { FaThLarge } from 'react-icons/fa';

const DashboardButton = () => {
  return (
    <Link href="/calendar" passHref>
      <div className="flex items-center p-4 text-white text-lg bg-transparent rounded-lg hover:bg-[#217853] cursor-pointer">
        <FaThLarge className="mr-2" size={24} />
        <span>Dashboard</span>
      </div>
    </Link>
  );
}

export default DashboardButton;
