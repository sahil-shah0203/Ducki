import React, { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import { api } from "~/trpc/react";
import { useDrag } from "../api/hooks/useDrag"; // Custom hook for dragging functionality
import logo from "../../../public/duck.png";

type SidebarProps = {
  userId: string; // Ensure this is a string
  classId: number;
  isCollapsed: boolean;
  uniqueSessionId: string; // Add uniqueSessionId to props
  onEndSession: () => void; // Function to handle the end session
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
  isCollapsed,
  uniqueSessionId, 
  onEndSession,
}) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [keyConcepts, setKeyConcepts] = useState<KeyConcept[]>([]); // Ensure initialization as an array
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [conceptsError, setConceptsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"documents" | "keyConcepts">(
    "documents",
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const { dragRef } = useDrag();

  const {
    data: documentsData = [],
    error,
    isLoading,
    refetch: refetchDocuments,
  } = api.documents.getDocumentsBySessionId.useQuery({
    sessionId: uniqueSessionId,
  });

  const { mutateAsync: deleteDocument } =
    api.documents.deleteDocument.useMutation();

  useEffect(() => {
    setDocuments(documentsData);
  }, [documentsData]);

  const handleDeleteDocument = async (docId: string) => {
    try {
      console.log("Deleting document with ID:", docId); // Debugging line
      await deleteDocument({ documentId: docId });
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc.id !== docId),
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
          }),
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
    <div
      ref={dragRef}
      className={`fixed right-10 top-10 z-50 ${
        isMinimized
          ? "bg-transparent p-0 shadow-none"
          : "bg-white p-4 shadow-lg"
      } rounded-md ${isMinimized ? "h-auto w-auto" : "h-auto w-96"}`}
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex h-20 w-20 items-center justify-center border-0 bg-transparent p-0"
          style={{
            backgroundImage: `url(${logo.src})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: 50,
            height: 50,
          }}
        ></button>
      ) : (
        <aside className="overflow-y-auto">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex space-x-2">
              {" "}
              {/* Adjusted spacing between buttons */}
              <button
                onClick={() => setActiveTab("documents")}
                className={`px-3 py-2 ${
                  activeTab === "documents"
                    ? "bg-[#7c9c87] text-white"
                    : "bg-[#407855] text-white"
                } rounded text-sm`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab("keyConcepts")}
                className={`px-3 py-2 ${
                  activeTab === "keyConcepts"
                    ? "bg-[#7c9c87] text-white"
                    : "bg-[#407855] text-white"
                } rounded text-sm`}
              >
                Key Concepts
              </button>
              <button
                className="rounded bg-blue-500 px-3 py-2 text-sm text-white"
                onClick={onEndSession} // Call the end session function
              >
                End Session
              </button>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="ml-2 text-gray-700 hover:text-gray-900"
            >
              <FaChevronDown />
            </button>
          </div>

          {activeTab === "documents" && (
            <div className="space-y-4">
              {isLoading && <div>Loading documents...</div>}
              {error && <div>Error loading documents: {error.message}</div>}
              {documents.length === 0 && !isLoading && (
                <div>No documents found</div>
              )}
              {documents.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="relative flex items-center rounded-md bg-[#217853] p-2"
                >
                  <button
                    onClick={() => handleDocumentClick(doc)}
                    className="flex-1 text-left text-white"
                  >
                    {doc.name}
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="absolute right-0 top-0 mr-1 mt-1 text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "keyConcepts" && (
            <div className="space-y-4">
              {isLoadingConcepts && <div>Loading key concepts...</div>}
              {conceptsError && <div>Error: {conceptsError}</div>}
              {keyConcepts.length === 0 && !isLoadingConcepts && (
                <div>No key concepts found</div>
              )}
              {Array.isArray(keyConcepts) &&
                keyConcepts.map((concept: KeyConcept) => (
                  <div key={concept.id} className="rounded-md bg-[#217853] p-2">
                    {concept.concept}
                  </div>
                ))}
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="mt-4 flex w-full items-center justify-center space-x-2 rounded bg-[#407855] p-2 text-white transition-colors hover:bg-[#7c9c87]"
          >
            <FaSyncAlt className="mr-2" />
            <span>Refresh</span>
          </button>
        </aside>
      )}
    </div>
  );
};

export default Sidebar;
