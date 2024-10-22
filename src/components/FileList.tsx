import React, { useState, useEffect, useRef } from "react";
import {
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
  deleteObject,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import { getAuth, User } from "firebase/auth"; // Import Firebase Auth et User type
import DeleteFile from "./ActionListFile/DeleteFile";
import DownloadFile from "./ActionListFile/DownloadFile";
import AppLoadScreen from "../pages/AppLoadScreen";
import Navbar from "../components/Navbar";
import RenameFile from "./RenameFile";

interface FileDetails {
  name: string;
  url: string;
  type: string;
  extension: string;
}

const FileList = () => {
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showNavbar, setShowNavbar] = useState<boolean>(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  const [showRenameModal, setShowRenameModal] = useState<boolean>(false); // État pour afficher la fenêtre de renommage
  const [fileToRename, setFileToRename] = useState<FileDetails | null>(null); // Stocke le fichier à renommer

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    setCurrentUser(user);
    if (user) {
      setUserId(user.uid);
      fetchFiles(user.uid);
    }
  }, []);

  const fetchFiles = async (uid: string) => {
    setLoading(true);
    setError(null);

    // Référence au dossier de l'utilisateur actuel
    const storageRefInstance = ref(storage, `uploads/${uid}/`);

    try {
      const result = await listAll(storageRefInstance);
      const filePromises = result.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        const metadata = await getMetadata(fileRef);

        const extension = fileRef.name.split(".").pop() || "unknown";

        return {
          name: fileRef.name,
          url,
          type: metadata.contentType || "unknown",
          extension,
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

  // Fonction pour fermer le Navbar en cas de clic en dehors
  const handleClickOutside = (event: MouseEvent) => {
    if (
      navbarRef.current &&
      !navbarRef.current.contains(event.target as Node)
    ) {
      setShowNavbar(false); // Cacher le Navbar si on clique en dehors
    }
  };

  useEffect(() => {
    // Ajouter l'événement pour détecter les clics en dehors du Navbar
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Nettoyer l'événement pour éviter les fuites de mémoire
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRenameClick = (file: FileDetails) => {
    setFileToRename(file); // Définit le fichier à renommer
    setShowRenameModal(true); // Affiche la fenêtre de renommage
  };

  const handleRename = async (newName: string) => {
    if (!fileToRename || !userId) return;

    const oldFileRef = ref(storage, `uploads/${userId}/${fileToRename.name}`);
    const newFileRef = ref(
      storage,
      `uploads/${userId}/${newName}.${fileToRename.extension}`
    );

    try {
      // Télécharger le fichier ancien en tant que blob
      const url = await getDownloadURL(oldFileRef);
      const response = await fetch(url);
      const blob = await response.blob();

      // Télécharger le blob sous le nouveau nom
      await uploadBytes(newFileRef, blob);

      // Supprimer l'ancien fichier
      await deleteObject(oldFileRef);

      // Recharger les fichiers
      await fetchFiles(userId);
      setShowRenameModal(false);
    } catch (error) {
      console.error("Error renaming file:", error);
    }
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
    <section className="">
      <h3 className="text-lg font-bold text-center">Uploaded Files</h3>

      {/* Trois barres horizontales en haut à gauche */}
      <button
        onClick={() => setShowNavbar(!showNavbar)}
        className="text-2xl mb-2"
      >
        &#9776;
      </button>

      {showNavbar && (
        <div ref={navbarRef}>
          {" "}
          <Navbar />
        </div>
      )}

      <div className="flex flex-rows xs:flex-col">
        <div className="grid xs:grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-6 border border-gray-400">
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
                    <div className="flex flex-rows space-x-2 text-center">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                      <p className="text-gray-500">Type: {file.type}</p>
                    </div>

                    {/* Actions (Téléchargement et suppression) */}
                    <div className="flex space-x-2 mt-4">
                      <DownloadFile
                        fileUrl={file.url}
                        fileName={file.name}
                        fileExtension={file.extension}
                      />
                      <button
                        onClick={() => handleRenameClick(file)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Rename
                      </button>
                      {userId && (
                        <DeleteFile
                          fileName={file.name}
                          onDelete={() => fetchFiles(userId)} // Assurez-vous que userId est non null
                          userId={userId}
                        />
                      )}
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
      {showRenameModal && fileToRename && (
        <RenameFile
          currentName={fileToRename.name}
          onRename={handleRename}
          onCancel={() => setShowRenameModal(false)}
        />
      )}
    </section>
  );
};

export default FileList;
