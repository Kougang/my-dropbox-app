import { useState } from "react";

import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

export interface FileVersion {
  versionName: string;
  url: string;
  timestamp: string;
}

export const fetchFileVersions = async (
  currentPath: string,
  fileName: string,
  userId: string
): Promise<FileVersion[]> => {
  try {
    let pathAfterUploads = currentPath.split("uploads/")[1];
    if (!pathAfterUploads) {
      pathAfterUploads = "";
    }

    // const fileRef = ref(
    //   storage,
    //   `uploads/${currentUser.uid}/${pathAfterUploads}/${fileName}/${versionedName}`
    // );

    const folderRef = ref(
      storage,
      `uploads/${userId}/${pathAfterUploads}/${fileName}`
    );
    const result = await listAll(folderRef);

    const versions = await Promise.all(
      result.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        const timestamp =
          fileRef.name.split("_")[1]?.split(".")[0] || "unknown";
        return {
          versionName: fileRef.name,
          url,
          timestamp,
        };
      })
    );

    return versions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Error fetching file versions:", error);
    return [];
  }
};
