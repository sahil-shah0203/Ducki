"use client";
import { Dispatch, SetStateAction } from 'react';

interface CalendarProps {
  selectedDate: string | null;
  setSelectedDate: Dispatch<SetStateAction<string | null>>;
}

export default function Calendar({ selectedDate, setSelectedDate }: CalendarProps) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold">Calendar</h2>
      <input
        type="date"
        className="w-full border rounded py-1 px-2"
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <div className="mt-2">{selectedDate ? `Selected Date: ${selectedDate}` : "No date selected"}</div>
    </div>
  );
}
