import React from "react";
import { Link } from "react-router-dom";
import UpdateDisplayName from "../components/UpdateDisplayName";
import UpdatePassword from "../components/UpdatePassword";

function UserProfil() {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-4">
      <div className="flex flex-row ">
        <Link to="/home" className="w-20 ">
          &#8592; Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      </div>
      <div className="  min-w-40  ">
        <hr />
        <hr />
        <hr />
      </div>

      {/* Composant pour mettre à jour le nom d'affichage */}
      <section className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Display Name</h2>
        <UpdateDisplayName />
      </section>

      {/* Composant pour mettre à jour le mot de passe */}
      <section className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Update Password</h2>
        <UpdatePassword />
      </section>
    </div>
  );
}

export default UserProfil;
