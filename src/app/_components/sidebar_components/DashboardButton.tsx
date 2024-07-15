'use client';

import { useRouter } from 'next/navigation';
import { FaThLarge } from 'react-icons/fa';

type DashboardButtonProps = {
  isSelected: boolean;
  onClick: () => void;
};

const DashboardButton = ({ isSelected, onClick }: DashboardButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    onClick();
    router.push('/dashboard');
  };

  return (
    <div
      className={`flex items-center p-4 text-white text-lg rounded-lg cursor-pointer transition-colors duration-300 ${isSelected ? "bg-[#217853]" : "hover:bg-[#217853]"}`}
    >
      <div className="flex items-center">
        <FaThLarge className="mr-2" size={24} />
        <span>Dashboard</span>
      </div>
    </div>
  );
}

export default DashboardButton;