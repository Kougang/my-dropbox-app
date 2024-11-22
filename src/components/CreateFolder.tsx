import React, { useState, useEffect } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

import { getAuth, User } from "firebase/auth";

import { FileDetails } from "./FileList";
interface CreateFolderProps {
  currentPath: string;
  onFolderCreated: () => void;
  setFiles: React.Dispatch<React.SetStateAction<FileDetails[]>>; // Fonction pour mettre à jour la liste des fichiers
}

const CreateFolder: React.FC<CreateFolderProps> = ({
  currentPath,
  onFolderCreated,
  setFiles,
}) => {
  const [folderName, setFolderName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    }
  }, []);

  const handleCreateFolder = async () => {
    let pathAfterUploads = currentPath.split("uploads/")[1];
    if (!pathAfterUploads) {
      pathAfterUploads = "";
    }

    // const folderRef = ref(storage, `${currentPath}/${userId}/${folderName}/`);
    const folderRef = ref(
      storage,
      `uploads/${userId}/${pathAfterUploads}/${folderName}/`
    );

    try {
      // Créer un dossier en utilisant une "balise fictive"
      const dummyFileRef = ref(folderRef, ".placeholder");
      await uploadBytes(dummyFileRef, new Blob([""], { type: "text/plain" }));

      // Ajouter immédiatement le dossier dans l'état `files`
      setFiles((prevFiles) => [
        ...prevFiles,
        {
          name: folderName,
          url: "",
          type: "folder",
          extension: "",
          isFolder: true,
        },
      ]);

      onFolderCreated();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Create New Folder</h3>
        <input
          type="text"
          placeholder="Folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="input"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button onClick={handleCreateFolder} className="btn btn-primary">
          Create
        </button>
        <button onClick={onFolderCreated} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateFolder;
