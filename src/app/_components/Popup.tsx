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
  groupID: string;
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
  subconcepts: string[];
};

const Sidebar: React.FC<SidebarProps> = ({
  userId,
  classId,
  isCollapsed,
  groupID,
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
  const [selectedButtons, setSelectedButtons] = useState<
    Record<number, number>
  >({});

  const {
    data: documentsData = [],
    error,
    isLoading,
    refetch: refetchDocuments,
  } = api.documents.getDocumentsByGroupId.useQuery({
    group_id: groupID,
  });

  const { mutateAsync: deleteDocument } =
    api.documents.deleteDocument.useMutation();

  const {
    data: keyConceptData,
    error: queryError,
    isLoading: keyConceptsLoading,
  } = api.keyconcepts.getKeyConcepts.useQuery({
    group_id: groupID,
    class_id: classId,
    user_id: Number(userId),
  });

  const deleteConcept = api.keyconcepts.deleteKeyConcept.useMutation();
  const editConcept = api.keyconcepts.editConcept.useMutation();
  const { mutateAsync: createKeyConcept } =
    api.keyconcepts.createKeyConcept.useMutation();
  const { mutateAsync: updateUnderstandingLevels } =
    api.keyconcepts.updateUnderstanding.useMutation();

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
      // Ensure subconcepts exists only for the appropriate type
      const keyConceptsWithSubconcepts = keyConceptData.map((concept) => {
        // Check if subconcepts exists, or provide an empty array for those that have subconcepts
        if ("subconcepts" in concept) {
          return {
            ...concept,
            subconcepts: concept.subconcepts || [],
          };
        } else {
          return {
            ...concept,
            subconcepts: [], // Add subconcepts as an empty array for the ones missing it
          };
        }
      });

      setKeyConcepts(keyConceptsWithSubconcepts);

      const initialSliderValues = keyConceptsWithSubconcepts.reduce(
        (acc, concept) => {
          if (concept.concept_id !== null) {
            acc[concept.concept_id] = concept.understanding_level || 1;
          }
          return acc;
        },
        {} as Record<number, number>,
      );

      setSelectedButtons(initialSliderValues);
      setIsLoadingConcepts(false);
    }
  };

  useEffect(() => {
    if (keyConceptsLoading) {
      setIsLoadingConcepts(true);
    } else {
      fetchKeyConcepts();
    }
  }, [groupID, isLoading, keyConceptData, queryError]); // Fetch key concepts when the uniqueSessionId changes

  // const handleAddKeyConcept = async (description: string) => {
  //   try {
  //     const result = await createKeyConcept({
  //       description,
  //       user_id: Number(userId),
  //       class_id: classId,
  //       group_id: groupID,
  //     });

  //     setKeyConcepts((prevKeyConcepts) => [
  //       ...prevKeyConcepts,
  //       {
  //         concept_id: result.newConcept.concept_id,
  //         description: result.newConcept.description,
  //         understanding_level: result.newConcept.understanding_level,
  //         subconcepts: Array.isArray(result.newConcept.subconcepts)
  //           ? result.newConcept.subconcepts.filter(
  //               (subconcept) => typeof subconcept === "string",
  //             ) // Ensure it's an array of strings
  //           : [], // Default to an empty array if subconcepts are not valid
  //       },
  //     ]);

  //     setSelectedButtons((prevSelectedButtons) => ({
  //       ...prevSelectedButtons,
  //       [result.newConcept.concept_id]: 1,
  //     }));
  //   } catch (error) {
  //     console.error("Failed to create key concept:", error);
  //   }
  // };

  const editKeyConcept = (concept: KeyConcept) => {
    setEditConceptId(concept.concept_id);
    setEditedDescription(concept.description);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDescription(e.target.value);
  };

  const saveKeyConcept = (concept_id: number) => {
    if (keyConceptData) {
      const updatedKeyConceptData = keyConcepts.map((concept) => {
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
    if (keyConcepts) {
      const updatedKeyConcepts = keyConcepts.filter(
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

  const handleUnderstandingChange = (
    conceptId: number,
    buttonNumber: number,
  ) => {
    setSelectedButtons((prevState) => ({
      ...prevState,
      [conceptId]: buttonNumber,
    }));
  };

  const saveUnderstandingChange = async () => {
    const updatedSliderValues: Record<number, number> = {};

    keyConcepts.forEach((concept) => {
      if (concept.concept_id !== null) {
        const conceptId = concept.concept_id;

        if (conceptId in selectedButtons) {
          const sliderValue = selectedButtons[conceptId];
          if (
            sliderValue !== undefined &&
            sliderValue !== concept.understanding_level
          ) {
            updatedSliderValues[conceptId] = sliderValue;
          }
        }
      }
    });

    if (Object.keys(updatedSliderValues).length > 0) {
      try {
        await updateUnderstandingLevels(updatedSliderValues);
      } catch (error) {
        console.error("Error updating understanding levels:", error);
      }
    } else {
      console.log("No updates to save.");
    }
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
                <div key={concept.concept_id}>
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
                      <div>
                        <p className="text-sm font-medium text-white">
                          {concept.description}
                        </p>
                        <div>
                          {concept.subconcepts?.map((subconcept, index) => (
                            <p key={index}>{subconcept}</p>
                          ))}
                        </div>
                      </div>
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

                  {/* Understanding buttons */}
                  {/* {<div className="mt-2 flex space-x-4">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        className={`flex-grow rounded bg-blue-500 font-bold text-white hover:bg-blue-700 ${
                          selectedButtons[concept.concept_id!] === num
                            ? "bg-blue-500"
                            : "bg-blue-100"
                        }`}
                        onClick={() =>
                          handleUnderstandingChange(concept.concept_id!, num)
                        }
                      >
                        {num}
                      </button>
                    ))}
                  </div>} */}
                </div>
              ))}
            </div>
          )}

          {activeTab === "keyConcepts" && (
            <div className="mt-4 flex space-x-2">
              {/* <button
                onClick={() => setIsModalOpen(true)}
                className="flex w-1/2 items-center justify-center space-x-2 rounded bg-[#407855] p-2 text-white transition-colors hover:bg-[#7c9c87]"
              >
                Add Key Concept
              </button> */}
              {/* <button
                onClick={saveUnderstandingChange}
                className="flex w-1/2 items-center justify-center space-x-2 rounded bg-green-500 p-2 text-white transition-colors hover:bg-green-700"
              >
                Save
              </button>

              <AddKeyConceptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddKeyConcept}
              /> */}
            </div>
          )}
        </aside>
      )}
    </div>
  );
};

export default Sidebar;
