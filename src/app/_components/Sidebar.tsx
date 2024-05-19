import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Ducki</h1>
        <nav>
          <ul>
            <li className="py-2">
              <Link href="#" className="hover:underline">
                Spring 2024
              </Link>
            </li>
            <li className="py-2 pl-4">
              <Link href="#" className="hover:underline">
                Neuroscience
              </Link>
            </li>
            <li className="py-2 pl-4 text-purple-400">
              <Link href="#" className="hover:underline">
                Biology
              </Link>
            </li>
            <li className="py-2 pl-4">
              <Link href="#" className="hover:underline">
                Physics
              </Link>
            </li>
            <li className="py-2">
              <Link href="#" className="hover:underline">
                New Class
              </Link>
            </li>
          </ul>
        </nav>
        <footer>
          <div className="py-2">
            <Link href="#" className="hover:underline">
              Archived
            </Link>
          </div>
          <div className="py-2 text-orange-400">
            <Link href="#" className="hover:underline">
              Fall 2022
            </Link>
          </div>
        </footer>
      </div>
    </aside>
  );
}
