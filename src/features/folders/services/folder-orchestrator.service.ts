import {
  createFolderLocal,
  deleteFolderLocal,
  renameFolderLocal,
  updateFolderVisibilityLocal,
} from "@folders/services/folder-local.service";
import {
  createFolderInFirestore,
  deleteFolderFromFirestore,
  renameFolderInFirestore,
  updateFolderVisibilityInFirestore,
} from "@folders/services/folder.service";
import type { Folder } from "@folders/types/folder.types";

export const createFolder = async (
  name: string,
  createdBy: string,
  visibility: "private" | "public" | "code" = "private",
  code?: string,
): Promise<Folder> => {
  const folder: Omit<Folder, "id"> = {
    name,
    createdBy,
    createdAt: new Date().toISOString(),
    visibility,
    code,
  };

  const fsFolder = await createFolderInFirestore(
    name,
    createdBy,
    visibility,
    code,
  );
  const folderWithId: Folder = fsFolder || {
    ...folder,
    id: `folder_${Date.now()}`,
  };

  createFolderLocal(folderWithId);
  return folderWithId;
};

export const renameFolder = async (id: string, name: string): Promise<void> => {
  await renameFolderInFirestore(id, name);
  renameFolderLocal(id, name);
};

export const updateFolderVisibility = async (
  id: string,
  visibility: "private" | "public" | "code",
  code?: string,
): Promise<void> => {
  await updateFolderVisibilityInFirestore(id, visibility, code);
  updateFolderVisibilityLocal(id, visibility, code);
};

export const deleteFolder = async (
  id: string,
  onTestsUpdate?: (tests: unknown[]) => void,
): Promise<void> => {
  await deleteFolderFromFirestore(id);
  deleteFolderLocal(id);

  if (onTestsUpdate) {
    const tests = JSON.parse(localStorage.getItem("tests") || "[]");
    const updated = tests.map((t: { folderId?: string }) => {
      if (t.folderId === id) {
        const { folderId, ...rest } = t;
        void folderId;
        return rest;
      }
      return t;
    });
    onTestsUpdate(updated);
  }
};
