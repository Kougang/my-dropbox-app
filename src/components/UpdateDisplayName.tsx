import React, { useState, useEffect } from "react";
import { getAuth, updateProfile, User } from "firebase/auth";
import app from "./../firebase/firebaseConfig";

const UpdateDisplayName: React.FC = () => {
  const auth = getAuth(app);
  const user = auth.currentUser as User | null;
  const [displayName, setDisplayName] = useState<string>("");
  const [currentDisplayName, setCurrentDisplayName] = useState<string>("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setCurrentDisplayName(user.displayName || "Nom inconnu");
    }
  }, [user]);

  const handleNameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert("Utilisateur non connecté.");
      return;
    }

    try {
      await updateProfile(user, { displayName });
      setCurrentDisplayName(displayName);
      alert("Nom mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du nom", error);
      alert("Une erreur est survenue lors de la mise à jour du nom.");
    }
  };

  return (
    <div className="bg-blue-500 text-white flex flex-col items-center justify-center p-3">
      <p className="mb-3">
        Nom actuel : <strong>{currentDisplayName}</strong>
      </p>
      <form
        onSubmit={handleNameChange}
        className="flex flex-col items-center justify-center"
      >
        <label htmlFor="lab">Modifier le nom :</label>
        <input
          type="text"
          id="lab"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="text-black mb-2"
        />
        <button
          type="submit"
          className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700 mt-2"
        >
          Mettre à jour
        </button>
      </form>
    </div>
  );
};

export default UpdateDisplayName;
