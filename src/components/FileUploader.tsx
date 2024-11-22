import React, { useState } from "react";
import { storage } from "../firebase/firebaseConfig"; // Assurez-vous que Firebase est bien configuré
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";

import { getAuth } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { FileDetails } from "./FileList";

interface UploadFilesProps {
  currentPath: string;
  onFileUploaded: (newFile: FileDetails) => void;
}
const FileUploader: React.FC<UploadFilesProps> = ({
  currentPath,
  onFileUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleFileUpload = () => {
    if (!file || !currentUser) return;

    let pathAfterUploads = currentPath.split("uploads/")[1];
    if (!pathAfterUploads) {
      pathAfterUploads = "";
    }
    //   console.log(
    //     "pathAfterUploads ",
    //     pathAfterUploads,
    //     "currentpath:",
    //     currentPath
    //   );

    //   const storageRef = ref(
    //     storage,
    //     `/uploads/${currentUser.uid}/${pathAfterUploads}/${file.name}`
    //   );

    const fileRef = ref(
      storage,
      `${currentPath}/${currentUser.uid}/${pathAfterUploads}/${file.name}`
    );
    const uploadTask = uploadBytesResumable(fileRef, file);

    setUploading(true);
    setError(null);

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
        setError("Upload failed.");
        setUploading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(fileRef);
          const metadata = await getMetadata(fileRef); // Appel correct à getMetadata

          const newFile: FileDetails = {
            name: file.name,
            url,
            type: metadata.contentType || "unknown",
            extension: file.name.split(".").pop() || "unknown",
            isFolder: false,
          };

          // Appel de la prop pour mettre à jour la liste des fichiers
          onFileUploaded(newFile);
        } catch (error) {
          console.error("Error fetching file details:", error);
          setError("Failed to retrieve uploaded file details.");
        } finally {
          setUploading(false);
          setFile(null); // Réinitialiser l'état
          setProgress(0); // Réinitialiser la barre de progression
        }
      }
    );
  };

  // const handleUpload = () => {
  //   if (!file) {
  //     setError("Please select a file first.");
  //     return;
  //   }

  //   if (!currentUser) {
  //     setError("You need to be logged in to upload files.");
  //     return;
  //   }
  //   setUploading(true);
  //   setError(null);

  //   // Utilisez l'UID de l'utilisateur dans le chemin du fichier
  //   // const storageRef = ref(storage, `uploads/${currentUser.uid}/${file.name}`);
  //   let pathAfterUploads = currentPath.split("uploads/")[1];
  //   if (!pathAfterUploads) {
  //     pathAfterUploads = "";
  //   }
  //   console.log(
  //     "pathAfterUploads ",
  //     pathAfterUploads,
  //     "currentpath:",
  //     currentPath
  //   );

  //   const storageRef = ref(
  //     storage,
  //     `/uploads/${currentUser.uid}/${pathAfterUploads}/${file.name}`
  //   );
  //   console.log(`/uploads/${currentUser.uid}/${pathAfterUploads}/${file.name}`);

  //   const uploadTask = uploadBytesResumable(storageRef, file);

  //   uploadTask.on(
  //     "state_changed",
  //     (snapshot) => {
  //       const progress = Math.round(
  //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100
  //       );
  //       setProgress(progress);
  //     },

  //     (error) => {
  //       console.error("Upload error:", error);
  //       setError("Failed to upload file.");
  //       setUploading(false);
  //     },
  //     () => {
  //       getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
  //         setUploading(false);
  //         setFile(null); // Réinitialiser l'état après l'upload
  //       });
  //     }
  //   );
  // };

  if (progress == 100) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center ">
      <div>UPLOAD FILES</div>
      <input type="file" onChange={handleFileChange} className="w-60 xs:w-40" />
      {file && <p className="text-green-500">File Selected </p>}
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleFileUpload}
        className="bg-blue-700 text-white py-1 px-1 w-full hover:bg-blue-500"
        disabled={uploading}
      >
        {uploading ? `Uploading (${progress}%)...` : "Upload"}
      </button>
    </div>
  );
};

export default FileUploader;
