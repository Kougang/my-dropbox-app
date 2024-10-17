import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "./firebase/firebaseConfig";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import AppLoadScreen from "./pages/AppLoadScreen";
import SignUp from "./pages/SignUp";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isFetch, setIsFetch] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsFetch(false);
        return;
      }
      setUser(null);
      setIsFetch(false);
    });
    return () => unsubscribe();
  }, []);

  if (isFetch) {
    return <AppLoadScreen />;
  }

  return (
    <div className="">
      <Router>
        <Routes>
          <Route path="/" element={<SignIn user={user} />} />
          <Route path="/SignUp" element={<SignUp user={user} />} />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
