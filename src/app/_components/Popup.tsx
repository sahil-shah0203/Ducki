import React, { useState, useEffect } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { api } from "~/trpc/react";
import { useDrag } from "../api/hooks/useDrag"; // Custom hook for dragging functionality
import logo from "../../../public/duck.png";
import { AddKeyConceptModal } from "./AddKeyConceptModal";

type SidebarProps = {
  userId: string;
  classId: number;
  isCollapsed: boolean;
  uniqueSessionId: string;
  onEndSession: () => void; // Function to handle the end session
};

type Document = {
  id: string;
  url: string;
  name: string;
};

type KeyConcept = {
  concept_id: number | null;
  description: string;
  understanding_level: number;
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
  const [keyConcepts, setKeyConcepts] = useState<KeyConcept[]>([]);
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [conceptsError, setConceptsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"documents" | "keyConcepts">(
    "documents",
  );
  const [editConceptId, setEditConceptId] = useState<number | null>(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const { dragRef, handleRef } = useDrag();

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

  const {
    data: keyConceptData,
    error: queryError,
    isLoading: keyConceptsLoading,
  } = api.keyconcepts.getKeyConcepts.useQuery({
    session_id: uniqueSessionId,
    class_id: classId,
    user_id: Number(userId),
  });

  const deleteConcept = api.keyconcepts.deleteKeyConcept.useMutation();
  const editConcept = api.keyconcepts.editConcept.useMutation();
  const { mutateAsync: createKeyConcept } =
    api.keyconcepts.createKeyConcept.useMutation();

  useEffect(() => {
    setDocuments(documentsData);
  }, [documentsData]);

  const handleDeleteDocument = async (docId: string) => {
    try {
      console.log("Deleting document with ID:", docId);
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

  const fetchKeyConcepts = () => {
    setIsLoadingConcepts(true);
    setConceptsError(null);

    if (queryError) {
      setConceptsError(queryError.message);
      console.error("Error in fetchKeyConcepts:", queryError);
    }

    if (keyConceptData) {
      setKeyConcepts(keyConceptData);
      setIsLoadingConcepts(false);
    }
  };

  useEffect(() => {
    if (keyConceptsLoading) {
      setIsLoadingConcepts(true);
    } else {
      fetchKeyConcepts();
    }
  }, [uniqueSessionId, isLoading, keyConceptData, queryError]); // Fetch key concepts when the uniqueSessionId changes

  const handleAddKeyConcept = async (description: string) => {
    try {
      const result = await createKeyConcept({
        description,
        user_id: Number(userId),
        class_id: classId,
        session_id: uniqueSessionId,
      });

      setKeyConcepts((prevKeyConcepts) => [
        ...prevKeyConcepts,
        {
          concept_id: result.newConcept.concept_id,
          description: result.newConcept.description,
          understanding_level: result.newConcept.understanding_level,
        },
      ]);
    } catch (error) {
      console.error("Failed to create key concept:", error);
    }
  };

  const editKeyConcept = (concept: KeyConcept) => {
    setEditConceptId(concept.concept_id);
    setEditedDescription(concept.description);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDescription(e.target.value);
  };

  const saveKeyConcept = (concept_id: number) => {
    if (keyConceptData) {
      const updatedKeyConceptData = keyConceptData.map((concept) => {
        if (concept.concept_id === concept_id) {
          return { ...concept, description: editedDescription };
        }
        return concept;
      });

      setKeyConcepts(updatedKeyConceptData);
    }
    editConcept.mutate(
      {
        concept_id,
        description: editedDescription,
      },
      {
        onError: (error) => {
          console.error(`Error updating key concept: ${error.message}`);
        },
      },
    );

    // Reset the edit state
    setEditConceptId(null);
  };

  const deleteKeyConcept = (concept_id: number) => {
    if (keyConceptData) {
      const updatedKeyConcepts = keyConceptData.filter(
        (concept) => concept.concept_id !== concept_id,
      );
      setKeyConcepts(updatedKeyConcepts);
    }

    deleteConcept.mutate(
      { concept_id },
      {
        onSuccess: (data) => {
          console.log(data.message);
          // refetch key concepts????
        },
        onError: (error) => {
          console.error(`Error deleting key concept: ${error.message}`);
        },
      },
    );
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
      {/* Draggable Header Section */}
      <div ref={handleRef} className="cursor-move">
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
          <div className="mb-2 flex items-center justify-between">
            <div className="flex space-x-2">
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
                onClick={onEndSession}
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
        )}
      </div>

      {/* Non-Draggable Content Section */}
      {!isMinimized && (
        <aside className="overflow-y-auto">
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
              {keyConcepts.map((concept) => (
                <div
                  key={concept.concept_id}
                  className="flex transform items-center justify-between rounded-md bg-gradient-to-r from-[#217853] to-[#1c5f46] p-2 shadow-md transition-shadow duration-300 ease-in-out hover:shadow-lg"
                >
                  {editConceptId === concept.concept_id ? (
                    <input
                      className="text-sm font-medium text-black"
                      value={editedDescription}
                      onChange={handleDescriptionChange}
                    />
                  ) : (
                    <p className="text-sm font-medium text-white">
                      {concept.description}
                    </p>
                  )}
                  <div className="ml-4 flex space-x-2">
                    {editConceptId === concept.concept_id ? (
                      <button
                        onClick={() => saveKeyConcept(concept.concept_id!)}
                        className="mr-4 rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => editKeyConcept(concept)}
                        className="absolute right-0 top-0 mr-5 mt-1 text-blue-500 hover:text-blue-700"
                      >
                        <FiEdit2 />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        deleteKeyConcept(concept.concept_id!);
                      }}
                      className="absolute right-0 top-0 mr-1 mt-1 text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "keyConcepts" && (
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 flex w-full items-center justify-center space-x-2 rounded bg-[#407855] p-2 text-white transition-colors hover:bg-[#7c9c87]"
              >
                <span>Add Key Concept</span>
              </button>
              <AddKeyConceptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddKeyConcept}
              />
            </div>
          )}
        </aside>
      )}
    </div>
  );
};

export default Sidebar;
