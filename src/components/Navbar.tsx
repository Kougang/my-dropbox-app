import React, { useState } from "react";
import { Link } from "react-router-dom";
import LockOut from "./LockOut/LockOut";
import FileUploader from "./FileUploader";
import { FileDetails } from "./FileList";
import CreateFolder from "./CreateFolder";

interface NavBarProps {
  currentPath: string;
  onFileUploaded: (newFile: FileDetails) => void;
  setFiles: React.Dispatch<React.SetStateAction<FileDetails[]>>;
  onFolderCreated: () => void;
  // showCreateFolderModal: boolean;
  //setShowCreateFolderModal: React.Dispatch<React.SetStateAction<FileDetails[]>>;
}
const Navbar: React.FC<NavBarProps> = ({
  currentPath,
  onFileUploaded,
  setFiles,
  onFolderCreated,
}) => {
  const [showContacts, setShowContacts] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] =
    useState<boolean>(false);

  const toggleContacts = () => {
    setShowContacts(!showContacts);
  };

  const showLockout = () => {
    setShowLock(!showLock);
  };

  const showFileUploader = () => {
    setShowFileUpload(!showFileUpload);
  };

  return (
    <nav className="w-70 border absolute bg-slate-600">
      <div className="min-w-40 hover:bg-slate-500 text-center">
        <button
          className="w-40 hover:bg-slate-500"
          onClick={() => setShowCreateFolderModal(!showCreateFolderModal)}
        >
          + Create Folder
        </button>
        <hr />
      </div>
      {showCreateFolderModal && (
        <CreateFolder
          currentPath={currentPath}
          onFolderCreated={() => {
            //setShowCreateFolderModal(false);
            //fetchFiles(userId!); // Recharge les fichiers
          }}
          setFiles={setFiles}
        />
      )}
      <hr />

      <div className="min-w-40 hover:bg-slate-500 text-center">
        <button onClick={showFileUploader} className="w-40 hover:bg-slate-500">
          Upload Files
        </button>
        <hr />

        {showFileUpload && (
          <FileUploader
            currentPath={currentPath}
            onFileUploaded={onFileUploaded}
            setFiles={setFiles}
          />
        )}
        <hr />
      </div>

      <div className="min-w-40 hover:bg-slate-500 text-center">
        <button onClick={toggleContacts} className="w-40 hover:bg-slate-500">
          Contacts
        </button>
        <hr />

        {showContacts && (
          <ul className=" ">
            <li>Email: kougangsopjio@gmail.com</li>
            <li>Whatsapp: +237 696232247</li>
            <li>Call: +237 682227197</li>
          </ul>
        )}
        <hr />
      </div>

      <div className="min-w-40 hover:bg-slate-500 text-center">
        <Link to="/profile" className="w-40 hover:bg-slate-500">
          Profile Page
        </Link>
        <hr />
      </div>

      <div className="min-w-40 hover:bg-slate-500 text-center">
        <button onClick={showLockout}>Sign Out</button>
        {showLock && <LockOut />}
        <hr />
      </div>
    </nav>
  );
};

export default Navbar;
