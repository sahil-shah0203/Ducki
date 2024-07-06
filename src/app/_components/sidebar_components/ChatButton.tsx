import Link from 'next/link';
import { FaRegCommentDots } from 'react-icons/fa'; // Adjusted icon

export default function ChatButton() {
  return (
    <Link href="/chat" passHref>
      <div className="flex items-center p-4 text-white text-lg bg-transparent rounded-lg hover:bg-[#217853] cursor-pointer">
        <FaRegCommentDots className="mr-2" size={24} />
        <span>Chat</span>
      </div>
    </Link>
  );
}
