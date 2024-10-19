import React from "react";

interface DownloadFileProps {
  fileUrl: string;
  fileName: string;
  fileExtension: string; // Ajouter l'extension ici
}

const DownloadFile: React.FC<DownloadFileProps> = ({
  fileUrl,
  fileName,
  fileExtension,
}) => {
  const handleDownload = () => {
    const completeFileName = `${fileName}.${fileExtension}`; // Créer le nom complet du fichier
    console.log("completeFileName", completeFileName);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = completeFileName; // Utiliser le nom complet pour le téléchargement
    link.click();
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
    >
      Download
    </button>
  );
};

export default DownloadFile;
