import React, { useState } from "react";
import { storage } from "../firebase/firebaseConfig"; // Assurez-vous que Firebase est bien configuré
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
  listAll, // Import pour lister les fichiers
} from "firebase/storage";

import { getAuth } from "firebase/auth";
import { FileDetails } from "./FileList";

interface UploadFilesProps {
  currentPath: string;
  onFileUploaded: (newFile: FileDetails) => void;
  setFiles: React.Dispatch<React.SetStateAction<FileDetails[]>>;
}

const FileUploader: React.FC<UploadFilesProps> = ({
  currentPath,
  onFileUploaded,
  setFiles,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fonction pour vérifier si un fichier existe déjà
  const checkFileExists = async (fileName: string): Promise<boolean> => {
    try {
      let pathAfterUploads = currentPath.split("uploads/")[1];
      if (!pathAfterUploads) {
        pathAfterUploads = "";
      }

      const folderRef = ref(
        storage,
        `${currentPath}/${currentUser?.uid}/${pathAfterUploads}`
      );

      const listResult = await listAll(folderRef);
      return listResult.items.some((item) => item.name === fileName);
    } catch (error) {
      console.error("Error checking file existence:", error);
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleFileUpload = async () => {
    if (!file || !currentUser) return;

    const fileName = file.name;
    const timestamp = new Date().toISOString();
    const versionedName = `${fileName.split(".")[0]}_${timestamp}.${file.name
      .split(".")
      .pop()}`;

    const fileRef = ref(storage, `${currentPath}/${fileName}/${versionedName}`);

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
          const metadata = await getMetadata(fileRef);

          onFileUploaded({
            name: fileName,
            url,
            type: metadata.contentType || "unknown",
            extension: file.name.split(".").pop() || "unknown",
            isFolder: false,
          });
        } catch (error) {
          console.error("Error fetching file details:", error);
          setError("Failed to retrieve uploaded file details.");
        } finally {
          setUploading(false);
          setFile(null);
          setProgress(0);
        }
      }
    );
  };

  // const handleFileUpload = async () => {
  //   if (!file || !currentUser) return;

  //   const fileName = file.name;

  //   // Vérification avant l'upload
  //   const exists = await checkFileExists(fileName);
  //   if (exists) {
  //     setError(`A file named "${fileName}" already exists in this folder.`);
  //     alert(
  //       `A file named "${fileName}" already exists in this folder. Please rename your file and try again.`
  //     );
  //     return;
  //   }

  //   let pathAfterUploads = currentPath.split("uploads/")[1];
  //   if (!pathAfterUploads) {
  //     pathAfterUploads = "";
  //   }

  //   const fileRef = ref(
  //     storage,
  //     `${currentPath}/${currentUser.uid}/${pathAfterUploads}/${fileName}`
  //   );
  //   const uploadTask = uploadBytesResumable(fileRef, file);

  //   setUploading(true);
  //   setError(null);

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
  //       setError("Upload failed.");
  //       setUploading(false);
  //     },
  //     async () => {
  //       try {
  //         const url = await getDownloadURL(fileRef);
  //         const metadata = await getMetadata(fileRef);

  //         setFiles((prevFiles) => [
  //           ...prevFiles,
  //           {
  //             name: file.name,
  //             url,
  //             type: metadata.contentType || "unknown",
  //             extension: file.name.split(".").pop() || "unknown",
  //             isFolder: false,
  //           },
  //         ]);
  //       } catch (error) {
  //         console.error("Error fetching file details:", error);
  //         setError("Failed to retrieve uploaded file details.");
  //       } finally {
  //         setUploading(false);
  //         setFile(null); // Réinitialiser l'état
  //         setProgress(0); // Réinitialiser la barre de progression
  //       }
  //     }
  //   );
  // };

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
