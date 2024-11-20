import React, { useState } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

interface CreateFolderProps {
  currentPath: string; // Chemin actuel où créer le dossier
  onFolderCreated: () => void; // Fonction appelée après la création du dossier
}

const CreateFolder: React.FC<CreateFolderProps> = ({
  currentPath,
  onFolderCreated,
}) => {
  const [folderName, setFolderName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError("Folder name cannot be empty.");
      return;
    }

    try {
      // Créer un fichier vide pour simuler un dossier
      const folderRef = ref(
        storage,
        `${currentPath}/${folderName}/placeholder.txt`
      );
      const placeholder = new Blob(["This is a placeholder file."]);
      await uploadBytes(folderRef, placeholder);

      onFolderCreated(); // Réactualiser la liste des fichiers et dossiers
    } catch (error) {
      console.error("Error creating folder:", error);
      setError("Failed to create folder. Please try again.");
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
