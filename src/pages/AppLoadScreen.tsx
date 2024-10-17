import React from "react";

function AppLoadScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <h2 className="text-lg font-semibold text-blue-700">
          Chargement en cours...
        </h2>
      </div>
    </div>
  );
}

export default AppLoadScreen;
