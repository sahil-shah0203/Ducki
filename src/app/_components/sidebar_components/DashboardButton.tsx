'use client';

import Link from 'next/link';
import { FaThLarge } from 'react-icons/fa';

type DashboardButtonProps = {
  isSelected: boolean;
  onClick: () => void;
};

const DashboardButton = ({ isSelected, onClick }: DashboardButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 text-white text-lg rounded-lg cursor-pointer transition-colors duration-300 ${isSelected ? "bg-[#217853]" : "hover:bg-[#217853]"}`}
    >
      <Link href="/dashboard" passHref>
        <div className="flex items-center">
          <FaThLarge className="mr-2" size={24} />
          <span>Dashboard</span>
        </div>
      </Link>
    </div>
  );
}

export default DashboardButton;
