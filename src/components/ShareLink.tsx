// src/components/ShareLink.tsx
import React, { useState } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

interface ShareLinkProps {
  filePath: string;
  fileName: string;
}

const ShareLink: React.FC<ShareLinkProps> = ({ filePath, fileName }) => {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<number>(60); // Expiration en minutes
  const [error, setError] = useState<string | null>(null);

  const generateLink = async () => {
    try {
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);

      // Génération d'un lien temporaire (ajout d'un timestamp pour expiration)
      const expirationTimestamp = Date.now() + expiration * 60 * 1000;
      const temporaryLink = `${url}?expires=${expirationTimestamp}`;

      setShareLink(temporaryLink);
    } catch (error) {
      console.error("Error generating share link:", error);
      setError("Failed to generate share link.");
    }
  };

  return (
    <div>
      <button
        onClick={generateLink}
        className="bg-green-500 text-white px-2 py-1 rounded"
      >
        Generate Link
      </button>
      {shareLink && (
        <div className="mt-2">
          <p>Share Link (expires in {expiration} minutes):</p>
          <input
            type="text"
            value={shareLink}
            readOnly
            className="w-full border px-2 py-1"
          />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ShareLink;
