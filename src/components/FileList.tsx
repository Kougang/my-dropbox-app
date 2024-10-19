import React, { useState, useEffect } from "react";
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import DeleteFile from "./ActionListFile/DeleteFile";
import DownloadFile from "./ActionListFile/DownloadFile";
import AppLoadScreen from "../pages/AppLoadScreen";
import Navbar from "../components/Navbar";

interface FileDetails {
  name: string;
  url: string;
  type: string;
  extension: string; // Ajoutez l'extension ici
}

const FileList = () => {
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    const storageRef = ref(storage, "uploads/");

    try {
      const result = await listAll(storageRef);
      const filePromises = result.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        const metadata = await getMetadata(fileRef);

        // Extraire l'extension du fichier
        const extension = fileRef.name.split(".").pop() || "unknown";

        return {
          name: fileRef.name,
          url,
          type: metadata.contentType || "unknown",
          extension, // Incluez l'extension ici
        };
      });

      const files = await Promise.all(filePromises);
      setFiles(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileDelete = () => {
    // Rafraîchit la liste des fichiers après suppression
    fetchFiles();
  };

  const renderFilePreview = (file: FileDetails) => {
    const mimeType = file.type;

    if (mimeType.startsWith("image/")) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-32 object-cover rounded"
        />
      );
    } else if (mimeType === "application/pdf") {
      return (
        <iframe
          src={file.url}
          title={file.name}
          className="w-full h-32"
          style={{ border: "1px solid #ccc" }}
        ></iframe>
      );
    } else if (mimeType.startsWith("audio/")) {
      return <audio controls src={file.url} className="w-full"></audio>;
    } else if (mimeType.startsWith("video/")) {
      return <video controls src={file.url} className="w-full h-32"></video>;
    } else if (mimeType === "text/plain") {
      return <p>Text File: {file.name}</p>;
    } else {
      return <p>Unknown File Type</p>;
    }
  };

  if (loading) {
    return <AppLoadScreen />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <section>
      <h3 className="text-lg font-bold mb-4">Uploaded Files</h3>
      <div className="flex flex-rows  xs:flex-col">
        <Navbar />
        <div className="grid xs:grid-cols-1 xs:mt-20  sm:grid-cols-2 sm:ml-40 lg:ml-40 lg:grid-cols-4 gap-6 border border-gray-400">
          {files.length > 0 ? (
            files.map((file) => (
              <li key={file.name} className="list-none">
                <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center">
                    {/* Prévisualisation du fichier */}
                    <div className="mb-4 w-full h-32">
                      {renderFilePreview(file)}
                    </div>

                    {/* Nom du fichier */}
                    <div className="flex flex-rows space-x-2 text-center ">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {/*{file.name}*/}
                        View
                      </a>
                      <p className="text-gray-500">Type: {file.type}</p>
                    </div>

                    {/* Actions (Téléchargement et suppression) */}
                    <div className="flex space-x-4 mt-4">
                      <DownloadFile
                        fileUrl={file.url}
                        fileName={file.name}
                        fileExtension={file.extension}
                      />
                      <DeleteFile
                        fileName={file.name}
                        onDelete={handleFileDelete}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FileList;
