import { useEffect, useState } from 'react';

// Define an interface to describe the shape of a class object
interface Class {
  class_id: number;
  class_name: string;
}

export default function ClassList() {
  // Use the interface to type your state
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    async function fetchClasses() {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);  // Assuming 'data' is an array of 'Class' objects
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
