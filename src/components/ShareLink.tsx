import React, { useState } from "react";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

interface ShareLinkProps {
  filePath: string;
  fileName: string;
}

const ShareLink: React.FC<ShareLinkProps> = ({ filePath, fileName }) => {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // État de la fenêtre modale

  const moveFileToTemporaryFolder = async (
    filePath: string,
    expiration: number
  ) => {
    try {
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);
      const response = await fetch(url);
      const fileBlob = await response.blob();

      const expirationTimestamp = Date.now() + expiration * 60 * 1000;
      const tempFolder = `sharedDocs-${expirationTimestamp}`;
      const tempFilePath = `${tempFolder}/${fileName}`;
      const tempFileRef = ref(storage, tempFilePath);

      await uploadBytes(tempFileRef, fileBlob);
      const tempUrl = await getDownloadURL(tempFileRef);
      setShareLink(tempUrl);

      setTimeout(async () => {
        await deleteObject(tempFileRef);
        setShareLink(null);
        setError("The shared link has expired.");
      }, expiration * 60 * 1000);
    } catch (error) {
      console.error("Error moving file to temporary folder:", error);
      setError("Failed to move file to temporary folder.");
    }
  };

  const generateLink = async () => {
    setError(null);
    await moveFileToTemporaryFolder(filePath, expiration);
  };

  return (
    <div>
      {/* Bouton pour ouvrir la fenêtre modale */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-500 text-white px-2 py-1 rounded"
      >
        Share Link
      </button>

      {/* Fenêtre modale */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Share File</h2>

            <label className="block mb-2">
              Expiration (minutes):
              <input
                type="number"
                value={expiration}
                onChange={(e) => setExpiration(Number(e.target.value))}
                className="w-full border px-2 py-1 mt-1"
              />
            </label>

            {shareLink ? (
              <div className="mt-4">
                <p>Share Link (expires in {expiration} minutes):</p>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="w-full border px-2 py-1"
                />
              </div>
            ) : (
              <div className="flex justify-end mt-4">
                <button
                  onClick={generateLink}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  Generate Link
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {shareLink && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareLink;
