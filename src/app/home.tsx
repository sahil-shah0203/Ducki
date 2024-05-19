"use client";

import { useState } from 'react';
import Calendar from './_components/Calendar';
import ToDoList from './_components/ToDoList';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-8">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Upload to Brainwave</div>
          <button className="bg-blue-500 text-white py-2 px-4 rounded">Ignore for now but can be feature</button>
        </div>
        <div className="mt-8">
          <h2 className="font-bold">Manual</h2>
          <div className="border mt-2 p-4">
            <button className="bg-green-500 text-white py-2 px-4 rounded">Add Concept</button>
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="flex-1 bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center">
            <span>Calendar?</span>
            <input
              type="date"
              className="border rounded py-1 px-2"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="mt-4">
            {selectedDate ? `Selected Date: ${selectedDate}` : "No date selected"}
          </div>
        </div>
        <aside className="w-64 bg-white p-4 border-l">
          <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <ToDoList />
        </aside>
      </div>
    </div>
  );
}