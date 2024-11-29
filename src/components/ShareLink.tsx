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

  const moveFileToTemporaryFolder = async (
    filePath: string,
    expiration: number
  ) => {
    try {
      // Récupérer l'URL de téléchargement du fichier source
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);

      // Télécharger le fichier en tant que Blob
      const response = await fetch(url);
      const fileBlob = await response.blob();

      // Définir le dossier temporaire
      const expirationTimestamp = Date.now() + expiration * 60 * 1000;
      const tempFolder = `sharedDocs-${expirationTimestamp}`;
      const tempFilePath = `${tempFolder}/${fileName}`;
      const tempFileRef = ref(storage, tempFilePath);

      // Uploader le fichier dans le dossier temporaire
      await uploadBytes(tempFileRef, fileBlob);

      // Générer le lien de téléchargement pour le fichier temporaire
      const tempUrl = await getDownloadURL(tempFileRef);
      setShareLink(tempUrl);

      // Planifier la suppression du fichier temporaire
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
    setShareLink(null);
    await moveFileToTemporaryFolder(filePath, expiration);
  };

  return (
    <div>
      <button
        onClick={generateLink}
        className="bg-green-500 text-white px-2 py-1 rounded"
      >
        Generate Share Link
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
