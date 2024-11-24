import React, { useState } from "react";

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
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  onClose,
  onSave,
  currentPermissions,
}) => {
  const [read, setRead] = useState(currentPermissions?.read || false);
  const [write, setWrite] = useState(currentPermissions?.write || false);
  const [expirationDate, setExpirationDate] = useState(
    currentPermissions?.expirationDate || ""
  );

  const handleSave = () => {
    onSave({
      read,
      write,
      ownerId: currentPermissions?.ownerId || "",
      expirationDate,
    });
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
