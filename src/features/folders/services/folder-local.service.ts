import { FOLDER_STORAGE_KEY } from "@folders/constants/folder.constants";
import type { Folder } from "@folders/types/folder.types";

export const getLocalFolders = (): Folder[] => {
  const raw = JSON.parse(localStorage.getItem(FOLDER_STORAGE_KEY) || "[]");
  return raw.map((f: Partial<Folder>) => ({
    id: f.id || "",
    name: f.name || "",
    createdBy: f.createdBy || "",
    createdAt: f.createdAt || "",
    visibility: f.visibility || "private",
    code: f.code,
  }));
};

const saveFoldersToLocal = (folders: Folder[]) => {
  localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(folders));
};

export const getFolderByCodeLocal = (code: string): Folder | null => {
  return getLocalFolders().find((f) => f.code === code) || null;
};

export const getLocalFolderById = (id: string): Folder | null => {
  return getLocalFolders().find((f) => f.id === id) || null;
};

export const createFolderLocal = (folder: Folder): void => {
  const folders = getLocalFolders();
  folders.push(folder);
  saveFoldersToLocal(folders);
};

export const renameFolderLocal = (id: string, name: string): void => {
  const folders = getLocalFolders();
  const idx = folders.findIndex((f) => f.id === id);
  if (idx >= 0) {
    folders[idx].name = name;
    saveFoldersToLocal(folders);
  }
};

export const updateFolderVisibilityLocal = (
  id: string,
  visibility: "private" | "public" | "code",
  code?: string,
): void => {
  const folders = getLocalFolders();
  const idx = folders.findIndex((f) => f.id === id);
  if (idx >= 0) {
    folders[idx].visibility = visibility;
    if (code !== undefined) folders[idx].code = code;
    else if (visibility !== "code") folders[idx].code = undefined;
    saveFoldersToLocal(folders);
  }
};

export const deleteFolderLocal = (id: string): void => {
  const folders = getLocalFolders().filter((f) => f.id !== id);
  saveFoldersToLocal(folders);
};
