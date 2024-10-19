import React from "react";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../firebase/firebaseConfig";

interface DeleteFileProps {
  fileName: string;
  onDelete: () => void; // Callback pour rafraîchir la liste après suppression
}

const DeleteFile: React.FC<DeleteFileProps> = ({ fileName, onDelete }) => {
  const handleDelete = async () => {
    const fileRef = ref(storage, `uploads/${fileName}`);

    try {
      await deleteObject(fileRef);
      console.log(`${fileName} has been deleted.`);
      onDelete(); // Appeler la fonction pour rafraîchir la liste des fichiers
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
    >
      Delete
    </button>
  );
};

export default DeleteFile;
