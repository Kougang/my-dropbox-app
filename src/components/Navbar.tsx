import React, { useState } from "react";
import LockOut from "./LockOut/LockOut";
import FileUploader from "./FileUploader";

function Navbar() {
  const [showContacts, setShowContacts] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

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
    <nav className="w-70 border border-1 border-blue-500 fixed absolute bg-slate-600">
      <div>
        <button onClick={showFileUploader} className="w-40 xs:w-auto">
          Upload Files
        </button>
        <hr />

        {showFileUpload && <FileUploader />}
      </div>

      <div>
        <button onClick={toggleContacts} className="w-40 xs:w-auto">
          Contacts
        </button>
        <hr />

        {showContacts && (
          <ul className=" text-center">
            <li>Email: kougangsopjio@gmail.com</li>
            <li>Whatsapp: +237 696232247</li>
            <li>Call: +237 682227197</li>
          </ul>
        )}
      </div>
      <div>
        <button onClick={showLockout} className="w-40 xs:w-auto">
          Sign Out
        </button>
        {showLock && <LockOut />}
      </div>
    </nav>
  );
}

export default Navbar;
