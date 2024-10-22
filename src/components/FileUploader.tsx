import React, { useState } from "react";
import { storage } from "../firebase/firebaseConfig"; // Assurez-vous que Firebase est bien configuré
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth"; // Import Firebase Auth

function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth(); // Obtenir l'instance d'authentification Firebase
  const currentUser = auth.currentUser; // Obtenir l'utilisateur connecté

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    if (!currentUser) {
      setError("You need to be logged in to upload files.");
      return;
    }

    setUploading(true);
    setError(null);

    // Utilisez l'UID de l'utilisateur dans le chemin du fichier
    const storageRef = ref(storage, `uploads/${currentUser.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setError("Failed to upload file.");
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploading(false);
          setFile(null); // Réinitialiser l'état après l'upload
        });
      }
    );
  };

  return (
    <div className="flex flex-col items-center">
      <input type="file" onChange={handleFileChange} />
      {file && <p>Selected file: {file.name}</p>}
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white py-2 px-4 rounded"
        disabled={uploading}
      >
        {uploading ? `Uploading (${progress}%)...` : "Upload"}
      </button>
    </div>
  );
}

export default FileUploader;
