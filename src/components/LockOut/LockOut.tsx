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
    <section className="flex flex-col items-center justify-center">
      <div>SIGN OUT</div>
      <div>
        <button
          onClick={handleSignOut}
          className="w-60 xs:w-40 bg-red-900 px-1 py-1 text-white  hover:bg-red-700 "
        >
          Sign Out
        </button>
      </div>
    </section>
  );
}

export default LockOut;
