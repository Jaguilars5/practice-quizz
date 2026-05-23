import { logError } from "@app/services/errorLogger";
import { FOLDER_COLLECTION } from "@folders/constants/folder.constants";
import type { Folder } from "@folders/types/folder.types";
import { mapFolder } from "@folders/utils/folder-mapper.util";
import { db } from "@shared/services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const foldersRef = () => {
  if (!db) throw new Error("Firestore no disponible");
  return collection(db, FOLDER_COLLECTION);
};

export const getFoldersFromFirestore = async (
  email: string,
): Promise<Folder[]> => {
  const q = query(foldersRef(), where("createdBy", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapFolder);
};

export const getPublicFoldersFromFirestore = async (): Promise<Folder[]> => {
  const q = query(foldersRef(), where("visibility", "==", "public"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapFolder);
};

export const getFolderByCodeFromFirestore = async (
  code: string,
): Promise<Folder | null> => {
  const q = query(foldersRef(), where("code", "==", code), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return mapFolder(snapshot.docs[0]);
};

export const createFolderInFirestore = async (
  name: string,
  createdBy: string,
  visibility: "private" | "public" | "code" = "private",
  code?: string,
): Promise<Folder | null> => {
  const folder = {
    name,
    createdBy,
    createdAt: new Date().toISOString(),
    visibility,
    code,
  };

  try {
    const ref = await addDoc(foldersRef(), folder);
    return { ...folder, id: ref.id };
  } catch (error) {
    logError(error, "folder.service:createFolder");
    return null;
  }
};

export const renameFolderInFirestore = async (
  id: string,
  name: string,
): Promise<boolean> => {
  if (!db) return false;
  try {
    await updateDoc(doc(db, FOLDER_COLLECTION, id), { name });
    return true;
  } catch (error) {
    logError(error, "folder.service:renameFolder");
    return false;
  }
};

export const updateFolderVisibilityInFirestore = async (
  id: string,
  visibility: "private" | "public" | "code",
  code?: string,
): Promise<boolean> => {
  if (!db) return false;
  try {
    const data: Record<string, unknown> = { visibility };
    if (code !== undefined) data.code = code;
    await updateDoc(doc(db, FOLDER_COLLECTION, id), data);
    return true;
  } catch (error) {
    logError(error, "folder.service:updateFolderVisibility");
    return false;
  }
};

export const deleteFolderFromFirestore = async (
  id: string,
): Promise<boolean> => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, FOLDER_COLLECTION, id));
    return true;
  } catch (error) {
    logError(error, "folder.service:deleteFolder");
    return false;
  }
};
