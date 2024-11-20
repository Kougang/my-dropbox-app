import React, { useState, useEffect } from "react";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from "firebase/auth";
import app from "./../firebase/firebaseConfig";

const UpdatePassword: React.FC = () => {
  const auth = getAuth(app);
  const user = auth.currentUser as User | null;
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "Email inconnu");
    }
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert("Utilisateur non connecté.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email || "",
        password
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Mot de passe mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe", error);
      alert("Une erreur est survenue lors de la mise à jour du mot de passe.");
    }
  };

  return (
    <div className="bg-blue-500 text-white flex flex-col items-center justify-center p-3">
      <p className="mb-3">
        Email actuel : <strong>{userEmail}</strong>
      </p>
      <form
        onSubmit={handlePasswordChange}
        className="flex flex-col items-center justify-center"
      >
        <label htmlFor="pwd">Mot de passe actuel :</label>
        <input
          type="password"
          id="pwd"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-black mb-2 border-2 border-black border-solid"
        />
        <label htmlFor="npw">Nouveau mot de passe :</label>
        <input
          type="password"
          id="npw"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="text-black mb-2 border-2 border-black border-solid"
        />
        <button
          type="submit"
          className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700 mt-2"
        >
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;
