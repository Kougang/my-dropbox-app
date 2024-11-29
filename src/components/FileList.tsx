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
import { getAuth, User } from "firebase/auth";
import DeleteFile from "./ActionListFile/DeleteFile";
import DownloadFile from "./ActionListFile/DownloadFile";
import AppLoadScreen from "../pages/AppLoadScreen";
import Navbar from "../components/Navbar";
import RenameFile from "./RenameFile";
import ShareLink from "./ShareLink";

import PermissionsModal from "./PermissionsModal";
export interface FileDetails {
  name: string;
  url: string;
  type: string;
  extension: string;
  isFolder: boolean;
  permissions?: {
    read: boolean;
    write: boolean;
    ownerId: string;
    expirationDate?: string;
  };
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
  const [currentPath, setCurrentPath] = useState<string>("uploads");
  const [folder, setFolder] = useState<boolean>(false);
  const [folderLink, setFolderLink] = useState<string | null>("");
  const [showPermissionModal, setShowPermissionModal] =
    useState<boolean>(false);
  const [fileForPermission, setFileForPermission] =
    useState<FileDetails | null>(null);

  const [selectShare, SetselectShare] = useState<string>("uploads");

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      setCurrentUser(user);
      fetchFiles(user.uid);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      setCurrentUser(user);
      fetchFiles(user.uid);
    }
  }, [currentPath]);

  const fetchFiles = async (uid: string) => {
    setLoading(true);
    setError(null);

    let pathAfterUploads = currentPath.split("uploads/")[1];
    if (!pathAfterUploads) {
      pathAfterUploads = "";
    }

    // const storageRefInstance = ref(storage, `${currentPath}/${uid}/`);
    const storageRefInstance = ref(
      storage,
      `uploads/${uid}/${pathAfterUploads}`
    );
    SetselectShare(`uploads/${uid}/${pathAfterUploads}`);
    setFolderLink(`uploads/${pathAfterUploads}`);
    try {
      const result = await listAll(storageRefInstance);

      // Récupération des fichiers
      const filePromises = result.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        const metadata = await getMetadata(fileRef);

        const extension = fileRef.name.split(".").pop() || "unknown";

        return {
          name: fileRef.name,
          url,
          type: metadata.contentType || "unknown",
          extension,
          isFolder: false,
        };
      });

      // Récupération des dossiers en vérifiant leur contenu
      const folderPromises = result.prefixes.map(async (folderRef) => {
        // Tester si le dossier contient un fichier factice ou non
        const subFolderRef = ref(storage, folderRef.fullPath);
        const folderContent = await listAll(subFolderRef);
        setFolder(true);

        return {
          name: folderRef.name,
          url: "", // Les dossiers n'ont pas d'URL
          type: "folder",
          extension: "",
          isFolder: true,
        };
      });

      // Fusionner fichiers et dossiers
      const filesAndFolders = await Promise.all([
        ...filePromises,
        ...folderPromises,
      ]);

      setFiles(filesAndFolders);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  const handleRenameClick = (file: FileDetails) => {
    setFileToRename(file); // Définit le fichier à renommer
    setShowRenameModal(true); // Affiche la fenêtre de renommage
  };

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

  const handleRename = async (newName: string) => {
    if (!fileToRename || !userId) return;

    const oldFileRef = ref(storage, `uploads/${userId}/${fileToRename.name}`);
    const newFileRef = ref(
      storage,
      `uploads/${userId}/${newName}.${fileToRename.extension}`
    );

    try {
      // Vérifier si le fichier avec le même nom existe déjà

      const newFileExists = await getDownloadURL(newFileRef).catch((error) => {
        // Si une erreur est levée, cela signifie que le fichier n'existe pas
        return false;
      });

      if (newFileExists) {
        console.error("A file with this name already exists.");
        setError("A file with this name already exists.");
        return;
      }

      // Obtenir l'URL du fichier ancien
      const url = await getDownloadURL(oldFileRef);

      // Télécharger le fichier avec le nouveau nom
      const response = await fetch(url);
      const blob = await response.blob();
      await uploadBytes(newFileRef, blob);

      // Supprimer l'ancien fichier
      await deleteObject(oldFileRef);

      // Recharger les fichiers
      await fetchFiles(userId);
      setShowRenameModal(false);
    } catch (error) {
      console.error("Error renaming file:", error);
      setError("Failed to rename the file. Please try again.");
    }
  };

  const handleFolderClick = (folder: FileDetails) => {
    if (folder.isFolder) {
      setCurrentPath(`${currentPath}/${folder.name}`);
      console.log(
        "dans filelist handlefolder click:",
        `${currentPath}/${folder.name}`
      );
    }
  };

  const addFileToList = (newFile: FileDetails) => {
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (!userId) return;

    let pathAfterUploads = currentPath.split("uploads/")[1];
    if (!pathAfterUploads) {
      pathAfterUploads = "";
    }

    const folderRef = ref(
      storage,
      `uploads/${userId}/${pathAfterUploads}/${folderName}`
    );

    try {
      const folderContent = await listAll(folderRef);

      // Supprimer les fichiers dans le dossier
      const deleteFilePromises = folderContent.items.map((file) =>
        deleteObject(file)
      );

      // Supprimer les sous-dossiers
      const deleteFolderPromises = folderContent.prefixes.map((subFolder) =>
        handleDeleteFolder(`${folderName}/${subFolder.name}`)
      );

      await Promise.all([...deleteFilePromises, ...deleteFolderPromises]);

      console.log(`Folder "${folderName}" has been deleted.`);
      fetchFiles(userId); // Actualiser la liste des fichiers
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const renderFilePreview = (file: FileDetails) => {
    if (file.isFolder) {
      console.log("it's an folder");
      return (
        <div className="flex flex-col items-center">
          <p className="text-gray-600 mt-2">{file.name}</p>
          <img
            src={`https://firebasestorage.googleapis.com/v0/b/my-dropbox-app-30892.appspot.com/o/uploads%2FfolderIcon.PNG?alt=media&token=63a6229a-f265-481e-87f8-5d8f77f7d6b9`}
            alt="Folder"
            className="w-full h-32"
          />
        </div>
      );
    }

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

  // if (loading) {
  //   return <AppLoadScreen />;
  // }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // console.log("current path", currentPath);
  return (
    <section className="">
      {currentUser && (
        <p className="text-xl font-semibold text-gray-800 text-center">
          {`Welcome, ${currentUser.displayName || "User"}`}
        </p>
      )}

      <h3 className="text-lg font-bold text-center">Uploaded Files</h3>
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => {
            const pathParts = currentPath.split("/");
            if (pathParts.length > 1) {
              setCurrentPath(pathParts.slice(0, -1).join("/"));
            }
          }}
          className="btn btn-secondary px-3 py-1 text-white bg-gray-500 hover:bg-gray-700 rounded"
        >
          Back
        </button>
        <h2 className="text-lg font-bold text-center">
          Current position: <span className="text-blue-600">{folderLink}</span>
          <hr></hr>
          <hr></hr>
        </h2>
      </div>

      {/* Trois barres horizontales en haut à gauche */}
      <button
        onClick={() => setShowNavbar(!showNavbar)}
        className="text-2xl mb-2"
      >
        &#9776;
      </button>

      {showNavbar && (
        <div ref={navbarRef}>
          <Navbar
            currentPath={currentPath}
            onFileUploaded={addFileToList}
            setFiles={setFiles}
            onFolderCreated={() => {}}
          />
        </div>
      )}
      {showPermissionModal && fileForPermission && (
        <PermissionsModal
          currentPermissions={fileForPermission.permissions}
          onClose={() => setShowPermissionModal(false)}
          onSave={(newPermissions) => {
            const updatedFiles = files.map((f) =>
              f.name === fileForPermission.name
                ? { ...f, permissions: newPermissions }
                : f
            );
            setFiles(updatedFiles);
          }}
        />
      )}

      <div className="flex flex-rows xs:flex-col">
        <div className="grid xs:grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-6 ">
          {files.length > 0 ? (
            files.map((file) => (
              <li key={file.name} className="list-none">
                <div
                  className={`bg-white shadow-md rounded-lg p-4 border ${
                    file.isFolder ? "border-blue-200" : "border-gray-200"
                  } border-gray-200 hover:shadow-lg transition-shadow`}
                >
                  <div className="flex flex-col items-center">
                    {/* Prévisualisation du fichier */}
                    <div
                      onClick={() => handleFolderClick(file)}
                      className="cursor-pointer mb-4 w-full h-32"
                    >
                      {renderFilePreview(file)}
                    </div>
                    {file.isFolder ? (
                      <div>
                        <p>FOLDER</p>
                      </div>
                    ) : (
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
                    )}
                    {/* Actions (Téléchargement et suppression) */}
                    <div className="flex space-x-2 mt-4">
                      <DownloadFile
                        fileUrl={file.url}
                        fileName={file.name}
                        fileExtension={file.extension}
                      />
                      {/* Nouveau composant ShareLink */}
                      {/* <ShareLink
                        filePath={`uploads/${userId}/${file.name}`}
                        fileName={file.name}
                      /> */}
                      <ShareLink
                        filePath={`${selectShare}/${file.name}`}
                        fileName={file.name}
                      />
                      {/*bouton de permissions*/}
                      <button
                        onClick={() => {
                          setShowPermissionModal(true);
                          setFileForPermission(file);
                        }}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        title="Permissions"
                      >
                        &#x1F6E1; {/* Icône de bouclier */}
                      </button>
                      <button
                        onClick={() => handleRenameClick(file)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        title="Rename"
                      >
                        &#x270F;
                      </button>
                      {file.isFolder ? (
                        <div className="bg-red-600   text-white rounded hover:bg-red-700 ">
                          <button
                            onClick={() => handleDeleteFolder(file.name)}
                            title="Delete Folder"
                            className="bg-red-600 py-1  px-3 text-white rounded hover:bg-red-700"
                          >
                            &#x1F5D1;
                          </button>
                        </div>
                      ) : (
                        <DeleteFile
                          fileName={file.name}
                          currentPath={currentPath}
                          userId={userId!}
                          onDelete={() => fetchFiles(userId!)} // Rafraîchir les fichiers après suppression
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

      {/* {error && (
        <div className="text-red-500 text-center mb-4"></div>
      )} */}
    </section>
  );
};

export default FileList;
