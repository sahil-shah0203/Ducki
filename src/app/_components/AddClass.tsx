'use client';

import { useState } from 'react';

export default function AddClass() {
  const [className, setClassName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/classes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ className }),
    });

    if (response.ok) {
      setClassName('');
      // Optionally, refresh the class list here
    } else {
      console.error('Error creating class');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        placeholder="Class Name"
      />
      <button type="submit">Add Class</button>
    </form>
  );
}
