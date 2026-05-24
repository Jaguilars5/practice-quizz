import { FLASHCARD_COLLECTION } from "@flashcards/constants/flashcard.constants";
import type { FlashcardSet } from "@flashcards/types/flashcard.types";
import { db } from "@shared/services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const ref = () => {
  if (!db) throw new Error("Firestore no disponible");
  return collection(db, FLASHCARD_COLLECTION);
};

export const getFlashcardSetsByCreator = async (
  email: string,
): Promise<FlashcardSet[]> => {
  const q = query(ref(), where("createdBy", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as FlashcardSet);
};

export const getGlobalFlashcardSets = async (): Promise<FlashcardSet[]> => {
  const q = query(ref(), where("visibility", "==", "global"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as FlashcardSet);
};

export const getFlashcardSetById = async (
  id: string,
): Promise<FlashcardSet | null> => {
  const snap = await getDoc(doc(db!, FLASHCARD_COLLECTION, id));
  return snap.exists()
    ? ({ ...snap.data(), id: snap.id } as FlashcardSet)
    : null;
};

export const getFlashcardSetByCode = async (
  code: string,
): Promise<FlashcardSet | null> => {
  const q = query(ref(), where("code", "==", code), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { ...d.data(), id: d.id } as FlashcardSet;
};

export const getFlashcardSetsByFolderId = async (
  folderId: string,
): Promise<FlashcardSet[]> => {
  const q = query(ref(), where("folderId", "==", folderId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as FlashcardSet);
};

export const saveFlashcardSetToFirestore = async (
  set: FlashcardSet,
): Promise<string | null> => {
  const data = {
    ...set,
    visibility: set.visibility || "private",
    code: set.code || "",
  };

  // Remove 'id' to avoid undefined value in Firestore
  const cleanData: Record<string, unknown> = { ...data };
  delete cleanData.id;
  if (!cleanData.code) delete cleanData.code;

  // If set has a valid Firestore ID, update directly
  if (set.id && !set.id.startsWith("flashcard_")) {
    try {
      await updateDoc(doc(db!, FLASHCARD_COLLECTION, set.id), cleanData);
      return set.id;
    } catch {
      // Fall through to create as new
    }
  }

  // If has code, check if document already exists
  if (cleanData.code) {
    const existing = await getFlashcardSetByCode(cleanData.code as string);
    if (existing) {
      await updateDoc(doc(db!, FLASHCARD_COLLECTION, existing.id), cleanData);
      return existing.id;
    }
  }

  // Create new document
  const ref_ = await addDoc(ref(), cleanData);
  return ref_.id;
};

export const deleteFlashcardSetFromFirestore = async (code: string) => {
  const found = await getFlashcardSetByCode(code);
  if (found) await deleteDoc(doc(db!, FLASHCARD_COLLECTION, found.id));
};
