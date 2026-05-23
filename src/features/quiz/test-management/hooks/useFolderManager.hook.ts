import { logError } from "@app/services/errorLogger";
import {
  createFolder,
  deleteFolder,
  getFolderByCodeFromFirestore,
  getFolderByCodeLocal,
  getLocalFolders,
  renameFolder,
  updateFolderVisibility,
} from "@folders/services";
import { hasFirebaseConfig } from "@shared/services/firebase";
import type { Folder } from "@shared/types";
import { useCallback, useState } from "react";

interface UseFolderManagerReturn {
  activeFolder: string | null;
  setActiveFolder: (id: string | null) => void;
  showNewFolder: boolean;
  setShowNewFolder: (show: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  folderSearchCode: string;
  setFolderSearchCode: (code: string) => void;
  folderSearching: boolean;
  folderSearchError: string;
  handleCreateFolder: (userEmail: string) => Promise<void>;
  handleJoinFolder: () => Promise<void>;
  handleUpdateFolderVisibility: (
    id: string,
    visibility: Folder["visibility"],
    code?: string,
  ) => Promise<void>;
  handleDeleteFolder: (
    id: string,
    onRefreshTests: () => void,
    onRefreshFolders: () => void,
  ) => Promise<void>;
  handleRenameFolder: (
    id: string,
    name: string,
    onRefreshFolders: () => void,
  ) => Promise<void>;
}

export const useFolderManager = (
  refreshFolders: () => void,
): UseFolderManagerReturn => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderSearchCode, setFolderSearchCode] = useState("");
  const [folderSearching, setFolderSearching] = useState(false);
  const [folderSearchError, setFolderSearchError] = useState("");

  const handleCreateFolder = useCallback(
    async (userEmail: string) => {
      if (!newFolderName.trim()) return;
      await createFolder(newFolderName.trim(), userEmail);
      setNewFolderName("");
      setShowNewFolder(false);
      refreshFolders();
    },
    [newFolderName, refreshFolders],
  );

  const handleJoinFolder = useCallback(async () => {
    const code = folderSearchCode.trim().toUpperCase();
    if (!code) return;

    setFolderSearching(true);
    setFolderSearchError("");

    const local = getFolderByCodeLocal(code);
    if (local) {
      setActiveFolder(local.id);
      setFolderSearchCode("");
      setFolderSearching(false);
      return;
    }

    if (hasFirebaseConfig) {
      try {
        const found = await getFolderByCodeFromFirestore(code);
        if (found) {
          const localFolders = getLocalFolders();
          if (!localFolders.find((f) => f.id === found.id)) {
            localFolders.push(found);
            localStorage.setItem("folders", JSON.stringify(localFolders));
          }
          setActiveFolder(found.id);
          setFolderSearchCode("");
          setFolderSearching(false);
          refreshFolders();
          return;
        }
      } catch (error) {
        logError(error, "useFolderManager:handleJoinFolder");
        setFolderSearchError("Error al buscar en Firestore");
        setFolderSearching(false);
        return;
      }
    }

    setFolderSearchError("No se encontró ninguna carpeta con ese código");
    setFolderSearching(false);
  }, [folderSearchCode, refreshFolders]);

  const handleUpdateFolderVisibility = useCallback(
    async (id: string, visibility: Folder["visibility"], code?: string) => {
      await updateFolderVisibility(id, visibility, code);
      refreshFolders();
    },
    [refreshFolders],
  );

  const handleDeleteFolder = useCallback(
    async (
      id: string,
      onRefreshTests: () => void,
      onRefreshFolders: () => void,
    ) => {
      await deleteFolder(id);
      onRefreshFolders();
      onRefreshTests();
      setActiveFolder(null);
    },
    [],
  );

  const handleRenameFolder = useCallback(
    async (id: string, name: string, onRefreshFolders: () => void) => {
      await renameFolder(id, name);
      onRefreshFolders();
    },
    [],
  );

  return {
    activeFolder,
    setActiveFolder,
    showNewFolder,
    setShowNewFolder,
    newFolderName,
    setNewFolderName,
    folderSearchCode,
    setFolderSearchCode,
    folderSearching,
    folderSearchError,
    handleCreateFolder,
    handleJoinFolder,
    handleUpdateFolderVisibility,
    handleDeleteFolder,
    handleRenameFolder,
  };
};
