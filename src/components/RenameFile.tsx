import React, { useState } from "react";

interface RenameFileProps {
  currentName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
}

const RenameFile: React.FC<RenameFileProps> = ({
  currentName,
  onRename,
  onCancel,
}) => {
  const [newName, setNewName] = useState(currentName);

  const handleRename = () => {
    if (newName.trim()) {
      console.log("Renaming to:", newName);
      onRename(newName);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-80 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Rename File</h2>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="border border-gray-300 p-2 mb-4 w-full"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameFile;
