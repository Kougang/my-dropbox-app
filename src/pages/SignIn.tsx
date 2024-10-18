import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Navigate, useNavigate } from "react-router-dom";

interface SignInProps {
  user: any;
}

function SignIn({ user }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [badpeErrorMessage, setBadpeErrorMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [badpe, setBadpe] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setBadpe(true);
      setErrorMessage("Please complete all fields");
      return;
    }

    setErrorMessage("");
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setBadpe(false);
        setBadpeErrorMessage("");
        setLoggedInUser(user);
      })
      .catch((error) => {
        setBadpe(true);
        setBadpeErrorMessage("Enter correct information");
        console.log("badpeErrorMessage", badpeErrorMessage);
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
  const SwitchToCreateAccount = () => {
    navigate("/SignUp");
  };

  return (
    <section className="flex items-center justify-center">
      <div className="w-full h-screen bg-slate-900 border border-white w-2/5 p-6 flex flex-col items-center">
        <form
          className="flex flex-col gap-2 bg-slate-50 p-5 rounded shadow-md"
          onSubmit={handleSignIn}
        >
          <h1 className="text-center text-slate-900 text-4xl mb-3">Sign In</h1>

          <label className="text-slate-900">Email</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            className="h-10 border border-slate-900 rounded p-4"
            required
          />

          <label className="text-slate-900">Password</label>
          <div className="xs:flex">
            <input
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              className="h-10 w-auto border border-slate-900 rounded p-4"
              required
            />
            <span
              role="img"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={handleEyes}
              className="xs:mt-2"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>

          {badpe && (
            <p className="text-red-500 text-center">{badpeErrorMessage}</p>
          )}

          <button
            type="submit"
            className="bg-slate-900 px-3 py-1.5 text-white my-3 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={SwitchToCreateAccount}
            className="text-red-500"
          >
            Create an account
          </button>
        </form>
      </div>
    </section>
  );
}

export default SignIn;
