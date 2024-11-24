import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "./../firebase/firebaseConfig"; // Importez votre config Firebase

interface Permissions {
  read: boolean;
  write: boolean;
  ownerId: string;
  expirationDate?: string;
}

interface PermissionsModalProps {
  onClose: () => void;
  onSave: (permissions: Permissions) => void;
  currentPermissions?: Permissions;
  fileId: string; // Ajoutez un ID de fichier pour associer les permissions
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  onClose,
  onSave,
  currentPermissions,
  fileId,
}) => {
  const [read, setRead] = useState(currentPermissions?.read || false);
  const [write, setWrite] = useState(currentPermissions?.write || false);
  const [expirationDate, setExpirationDate] = useState(
    currentPermissions?.expirationDate || ""
  );

  const db = getFirestore(app);
  const handleSave = async () => {
    const newPermissions: Permissions = {
      read,
      write,
      ownerId: currentPermissions?.ownerId || "",
      expirationDate,
    };

    try {
      // Enregistrez dans Firestore
      const docRef = doc(db, "files", fileId, "permissions", "userPermissions");
      await setDoc(docRef, newPermissions);
      console.log("Permissions saved successfully!");
    } catch (error) {
      console.error("Error saving permissions: ", error);
    }

    onSave(newPermissions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Set Permissions</h2>
        <div>
          <label>
            <input
              type="checkbox"
              checked={read}
              onChange={(e) => setRead(e.target.checked)}
            />
            Read
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={write}
              onChange={(e) => setWrite(e.target.checked)}
            />
            Write
          </label>
        </div>
        <div>
          <label>
            Expiration Date:
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;
