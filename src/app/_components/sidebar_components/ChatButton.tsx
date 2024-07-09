'use client';

import Link from 'next/link';
import { FaRegCommentDots } from 'react-icons/fa';

type ChatButtonProps = {
  isSelected: boolean;
  onClick: () => void;
};

const ChatButton = ({ isSelected, onClick }: ChatButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 text-white text-lg rounded-lg cursor-pointer transition-colors duration-300 ${isSelected ? "bg-[#217853]" : "hover:bg-[#217853]"}`}
    >
      <Link href="/chat" passHref>
        <div className="flex items-center">
          <FaRegCommentDots className="mr-2" size={24} />
          <span>Chat</span>
        </div>
      </Link>
    </div>
  );
}

export default ChatButton;
