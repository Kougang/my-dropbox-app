import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { getDatabase, ref, set } from "firebase/database";
import CheckUsername from "./CheckUsername";
import { Navigate, useNavigate } from "react-router-dom";

interface SignUpProps {
  user: any;
}

function SignUp({ user }: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name) {
      setErrorMessage("Please fill out all fields");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, { displayName: name }).then(() => {
          const db = getDatabase();
          set(ref(db, "users/" + user.uid), {
            displayName: name,
            email: user.email,
            privacy: "public",
          }).then(() => {
            setLoggedInUser(user);
          });
        });
      })
      .catch((error) => {
        setErrorMessage("Network failed");
        console.log("errorMessage", error.message);
        console.error(error.code, error.message);
      });
  };

  const handleEyes = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  if (user || loggedInUser) {
    return <Navigate to="/Home" />;
  }

  const SwitchToCreatesignIn = () => {
    navigate("/");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md p-6 flex flex-col items-center">
        <form
          className="flex flex-col gap-2 bg-slate-50 p-5 rounded shadow-md w-full"
          onSubmit={handleSignUp}
        >
          <h1 className="text-center text-slate-900 text-4xl mb-3">Sign Up</h1>

          <label className="text-slate-900">Name</label>
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            name="name"
            className="h-10 border border-slate-900 rounded p-4 w-full"
            required
          />
          <CheckUsername username={name} onCheck={setIsUsernameAvailable} />

          <label className="text-slate-900">Email</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            className="h-10 border border-slate-900 rounded p-4 w-full"
            required
          />

          <label className="text-slate-900">Password</label>
          <div className="flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              className="h-10 w-full border border-slate-900 rounded p-4"
              required
            />
            <span
              role="img"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={handleEyes}
              className="ml-2 cursor-pointer"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="bg-slate-900 px-3 py-1.5 text-white my-3 rounded hover:bg-blue-700"
            disabled={!isUsernameAvailable}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={SwitchToCreatesignIn}
            className="text-green-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
