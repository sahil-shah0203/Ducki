import { FaThLarge } from "react-icons/fa";

const DashboardButton = () => {
  return (
      <div
        className={`flex cursor-pointer items-center rounded-lg p-4 text-lg text-white transition-colors duration-300`}
      >
        <div className="flex items-center">
          <FaThLarge className="mr-2" size={24} />
          <span>Dashboard</span>
        </div>
      </div>
  );
};

export default DashboardButton;
