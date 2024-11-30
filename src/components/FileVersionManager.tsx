import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

export interface FileVersion {
  versionName: string;
  url: string;
  timestamp: string;
}

export const fetchFileVersions = async (
  currentPath: string,
  fileName: string
): Promise<FileVersion[]> => {
  try {
    const folderRef = ref(storage, `${currentPath}/${fileName}`);
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
