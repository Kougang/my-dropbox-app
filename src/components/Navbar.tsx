import React from "react";
import LockOut from "./LockOut/LockOut";
import FileUploader from "./FileUploader";

function Navbar() {
  return (
    <nav className="w-70   border border-1 border-blue-500 fixed absolute bg-slate-600 ">
      <FileUploader />
      <hr />
      <hr />
      <hr />
      <hr className="mb-1" />
      <LockOut />
    </nav>
  );
}

export default Navbar;
