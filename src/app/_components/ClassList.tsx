'use client';

import { useEffect, useState } from 'react';

export default function ClassList() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    async function fetchClasses() {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
    }

    fetchClasses();
  }, []);

  return (
    <div>
      <h2>Your Classes</h2>
      <ul>
        {classes.map((cls) => (
          <li key={cls.class_id}>{cls.class_name}</li>
        ))}
      </ul>
    </div>
  );
}
