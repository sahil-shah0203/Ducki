import AddClass from './_components/AddClass';
import ClassList from './_components/ClassList';

export default function NewClassPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add a New Class</h1>
      <AddClass />
      <h2 className="text-xl font-bold mt-8">Your Classes</h2>
      <ClassList />
    </div>
  );
}
