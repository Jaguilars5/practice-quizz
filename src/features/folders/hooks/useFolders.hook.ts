import { getLocalFolders } from "@folders/services";
import { useMemo } from "react";

export const useFolders = () => {
  const folders = useMemo(() => getLocalFolders(), []);
  return folders;
};
