import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

// Définition des types pour les props
interface CheckUsernameProps {
  username: string; // username est de type string
  onCheck: (isAvailable: boolean) => void; // onCheck est une fonction qui prend un booléen
}

function CheckUsername({ username, onCheck }: CheckUsernameProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null); // boolean ou null
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (username) {
      setChecking(true);

      const db = getDatabase();
      const usersRef = ref(db, "users");

      onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usernames = Object.values(usersData).map(
            (user: any) => user.displayName
          ); // user est de type any

          if (usernames.includes(username)) {
            setIsAvailable(false); // Nom d'utilisateur pris
            onCheck(false);
          } else {
            setIsAvailable(true); // Nom d'utilisateur disponible
            onCheck(true);
          }
        }
        setChecking(false);
      });
    } else {
      setIsAvailable(null); // Réinitialiser si le champ est vide
    }
  }, [username, onCheck]);

  return (
    <div>
      {checking && <p className="text-gray-500">Vérification en cours...</p>}

      {isAvailable !== null && !checking && (
        <p className={isAvailable ? "text-green-500" : "text-red-500"}>
          {isAvailable
            ? "Nom d'utilisateur disponible"
            : "Ce nom d'utilisateur est déjà pris."}
        </p>
      )}
    </div>
  );
}

export default CheckUsername;
