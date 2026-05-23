import { logError } from "@app/services/errorLogger";
import { getTestsByFolderId } from "@quiz/test-management/services";
import type { Folder, Test } from "@shared/types";
import { useEffect, useState } from "react";

export const useSharedFolderTests = (
  activeFolder: string | null,
  folders: Folder[],
  userEmail: string | undefined,
): Test[] => {
  const [sharedFolderTests, setSharedFolderTests] = useState<Test[]>([]);
  const [loadedFolderId, setLoadedFolderId] = useState<string | null>(null);

  const folder =
    activeFolder && activeFolder !== "__uncategorized"
      ? folders.find((f) => f.id === activeFolder)
      : undefined;
  const shouldFetch = !!(folder && folder.createdBy !== userEmail);

  useEffect(() => {
    if (!shouldFetch || !activeFolder) return;
    let cancelled = false;
    const loadShared = async () => {
      try {
        const folderTests = await getTestsByFolderId(activeFolder);
        if (!cancelled) {
          setSharedFolderTests(folderTests);
          setLoadedFolderId(activeFolder);
        }
      } catch (error) {
        logError(error, "useSharedFolderTests:loadShared");
        if (!cancelled) {
          setSharedFolderTests([]);
          setLoadedFolderId(activeFolder);
        }
      }
    };
    loadShared();
    return () => {
      cancelled = true;
    };
  }, [activeFolder, shouldFetch]);

  if (!shouldFetch || loadedFolderId !== activeFolder) return [];
  return sharedFolderTests;
};
