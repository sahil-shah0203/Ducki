import React, { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaSyncAlt,
} from "react-icons/fa";
import { api } from "~/trpc/react";

type SidebarProps = {
  userId: string; // Ensure this is a string
  classId: number;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  uniqueSessionId: string; // Add uniqueSessionId to props
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

const Sidebar: React.FC<SidebarProps> = ({
  userId,
  classId,
  toggleSidebar,
  isCollapsed,
  uniqueSessionId, // Destructure uniqueSessionId from props
}) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [keyConcepts, setKeyConcepts] = useState<KeyConcept[]>([]); // Ensure initialization as an array
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [conceptsError, setConceptsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"documents" | "keyConcepts">(
    "documents"
  );

  const {
    data: documentsData = [],
    error,
    isLoading,
    refetch: refetchDocuments,
  } = api.documents.getDocumentsByUserAndClass.useQuery({
    userId: parseInt(userId),
    classId,
  });

  const { mutateAsync: deleteDocument } =
    api.documents.deleteDocument.useMutation();

  useEffect(() => {
    setDocuments(documentsData);
    console.log("Fetched documents:", documentsData); // Debugging line
  }, [documentsData]);

  const handleDeleteDocument = async (docId: string) => {
    try {
      console.log("Deleting document with ID:", docId); // Debugging line
      await deleteDocument({ documentId: docId });
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc.id !== docId)
      );
      if (selectedDocument && selectedDocument.id === docId) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  const handleDocumentClick = (doc: Document) => {
    // Open the PDF in a new tab for preview
    window.open(doc.url, "_blank");
  };

  const fetchKeyConcepts = async () => {
    try {
      setIsLoadingConcepts(true);
      setConceptsError(null);

      console.log("Fetching key concepts with session:", uniqueSessionId); // Debugging line
      const response = await fetch("/api/getKeyConcepts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: classId, // Use classId as the class identifier
          session: uniqueSessionId, // Use uniqueSessionId as the session identifier
        }),
      });

      console.log("Response status:", response.status); // Debugging line
      if (!response.ok) {
        throw new Error(`Error fetching key concepts: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API response for key concepts:", data); // Debugging line

      // Parse the concepts JSON string
      const parsedData = JSON.parse(data.concepts);

      // Check if main_topics is an array
      if (Array.isArray(parsedData.main_topics)) {
        const concepts = parsedData.main_topics.map(
          (concept: string, index: number) => ({
            id: index,
            concept,
          })
        );
        setKeyConcepts(concepts);
      } else {
        throw new Error("No key concepts returned from API");
      }
    } catch (error: any) {
      setConceptsError(error.message || "An error occurred");
      console.error("Error in fetchKeyConcepts:", error); // Debugging line
    } finally {
      setIsLoadingConcepts(false);
    }
  };

  useEffect(() => {
    fetchKeyConcepts();
  }, [uniqueSessionId]); // Fetch key concepts when the uniqueSessionId changes

  const handleRefresh = () => {
    refetchDocuments(); // Refetch documents
    fetchKeyConcepts(); // Refetch key concepts
  };

  // Ensure the sidebar appears only when isCollapsed is false
  if (isCollapsed) return null;

  return (
    <div className="fixed right-0 top-0 h-full z-50">
      <aside
        className={`h-full ${
          isCollapsed ? "w-16" : "w-64"
        } transition-width overflow-y-auto overflow-x-hidden bg-gray-800 p-4 text-white duration-300`}
      >
        <div className="flex space-x-1 bg-blue-900/20 p-1">
          <button
            onClick={() => setActiveTab("documents")}
            className={`p-2 ${
              activeTab === "documents" ? "bg-white text-black" : "text-white"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("keyConcepts")}
            className={`p-2 ${
              activeTab === "keyConcepts" ? "bg-white text-black" : "text-white"
            }`}
          >
            Key Concepts
          </button>
        </div>

        {activeTab === "documents" && (
          <div className="mt-2 space-y-4">
            {isLoading && <div>Loading documents...</div>}
            {error && <div>Error loading documents: {error.message}</div>}
            {documents.length === 0 && !isLoading && (
              <div>No documents found</div>
            )}
            {documents.map((doc: Document) => (
              <div
                key={doc.id}
                className="relative flex items-center p-2 bg-gray-700 rounded-md"
              >
                <button
                  onClick={() => handleDocumentClick(doc)}
                  className="text-left flex-1"
                >
                  {doc.name}
                </button>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="absolute top-0 right-0 mt-1 mr-1 text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "keyConcepts" && (
          <div className="mt-2 space-y-4">
            {isLoadingConcepts && <div>Loading key concepts...</div>}
            {conceptsError && <div>Error: {conceptsError}</div>}
            {keyConcepts.length === 0 && !isLoadingConcepts && (
              <div>No key concepts found</div>
            )}
            {Array.isArray(keyConcepts) &&
              keyConcepts.map((concept: KeyConcept) => (
                <div key={concept.id} className="p-2 bg-gray-700 rounded-md">
                  {concept.concept}
                </div>
              ))}
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="mt-4 flex w-full items-center justify-center space-x-2 p-2 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors"
        >
          <FaSyncAlt className="mr-2" />
          <span>Refresh</span>
        </button>

        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 focus:outline-none"
        >
          {isCollapsed ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </aside>
    </div>
  );
};

export default Sidebar;
