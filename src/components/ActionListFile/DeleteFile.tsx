import React from "react";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../firebase/firebaseConfig";

interface DeleteFileProps {
  currentPath: string;
  fileName: string;
  onDelete: () => void; // Callback pour rafraîchir la liste après suppression
  userId: string;
}

const DeleteFile: React.FC<DeleteFileProps> = ({
  fileName,
  onDelete,
  userId,
  currentPath,
}) => {
  const handleDelete = async () => {
    let pathAfterUploads = currentPath.split("uploads/")[1];
    if (!pathAfterUploads) {
      pathAfterUploads = "";
    }

    // const fileRef = ref(storage, `uploads/${userId}/${fileName}`);
    const fileRef = ref(
      storage,
      `uploads/${userId}/${pathAfterUploads}/${fileName}`
    );

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
      title="Delete"
      className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
    >
      &#x1F5D1;
    </button>
  );
};

export default DeleteFile;
