"use client";

import React, { useState, useEffect } from "react";
import { FaEllipsisV, FaPlus, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { api } from "~/trpc/react";
import { Tab } from "@headlessui/react";

type SidebarProps = {
  userId: string; // Ensure this is a string
  classId: number;
  toggleSidebar: () => void;
  isCollapsed: boolean;
};

type Document = {
  id: string; // Using document_id as id
  url: string;
  name: string;
};

type KeyConcept = {
  id: number;
  concept: string;
};

const dummyKeyConcepts: KeyConcept[] = [
  { id: 1, concept: "Cell Theory" },
  { id: 2, concept: "Genetics" },
  { id: 3, concept: "Evolution" },
  // Add more concepts as needed
];

const Sidebar: React.FC<SidebarProps> = ({ userId, classId, toggleSidebar, isCollapsed }) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const { data: documentsData = [], error, isLoading } = api.documents.getDocumentsByUserAndClass.useQuery({
    userId: parseInt(userId),
    classId,
  });

  const { mutateAsync: deleteDocument } = api.documents.deleteDocument.useMutation();

  useEffect(() => {
    setDocuments(documentsData);
    console.log("Fetched documents:", documentsData); // Debugging line
  }, [documentsData]);

  const handleDeleteDocument = async (docId: string) => {
    try {
      console.log("Deleting document with ID:", docId); // Debugging line
      await deleteDocument({ documentId: docId });
      setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== docId));
      if (selectedDocument && selectedDocument.id === docId) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const closeDocumentPreview = () => {
    setSelectedDocument(null);
  };

  return (
    <aside
      className={`fixed right-0 top-0 h-full ${isCollapsed ? "w-16" : "w-64"} transition-width overflow-y-auto overflow-x-hidden bg-gray-800 p-4 text-white duration-300`}
    >
      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-blue-900/20 p-1">
          <Tab as="button" className={({ selected }: { selected: boolean }) => selected ? "bg-white text-black" : "text-white"}>
            Documents
          </Tab>
          <Tab as="button" className={({ selected }: { selected: boolean }) => selected ? "bg-white text-black" : "text-white"}>
            Key Concepts
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="mt-2 space-y-4">
            {isLoading && <div>Loading documents...</div>}
            {error && <div>Error loading documents: {error.message}</div>}
            {documents.length === 0 && !isLoading && <div>No documents found</div>}
            {documents.map((doc: Document) => (
              <div key={doc.id} className="relative flex items-center p-2 bg-gray-700 rounded-md">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" onClick={() => handleDocumentClick(doc)}>
                  {doc.name}
                </a>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="absolute top-0 right-0 mt-1 mr-1 text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </Tab.Panel>
          <Tab.Panel className="mt-2 space-y-4">
            {dummyKeyConcepts.map((concept: KeyConcept) => (
              <div key={concept.id} className="p-2 bg-gray-700 rounded-md">
                {concept.concept}
              </div>
            ))}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <button
        onClick={toggleSidebar}
        className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 focus:outline-none"
      >
        {isCollapsed ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative p-4 bg-white rounded-md">
            <button onClick={closeDocumentPreview} className="absolute top-0 right-0 mt-2 mr-2 text-black">
              <FaTimes />
            </button>
            <h2 className="mb-4 text-2xl font-bold">{selectedDocument.name}</h2>
            <iframe src={selectedDocument.url} className="w-full h-96" title="Document Preview"></iframe>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
