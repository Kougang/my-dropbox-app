import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

function LockOut() {
  const navigate = useNavigate(); // Note que la variable commence par une minuscule

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Déconnexion réussie");
        navigate("/"); // Redirection vers la page d'accueil après déconnexion
      })
      .catch((error) => console.error("Erreur lors de la déconnexion:", error));
  };

  return (
    <section className="flex items-center justify-center">
      <div>
        <button
          onClick={handleSignOut}
          className="bg-red-900 px-6 py-3 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </section>
  );
}

export default LockOut;
