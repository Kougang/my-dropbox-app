import React from "react";
import LockOut from "./LockOut/LockOut";

function Navbar() {
  return (
    <nav className="w-40   border border-1 border-blue-500 fixed">
      <LockOut />
    </nav>
  );
}

export default Navbar;
