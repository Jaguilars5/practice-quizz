import { TEST_COLLECTION } from "@quiz/constants/quiz.constants";
import type { Test } from "@quiz/test-management/types/test.types";
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

const testsRef = () => {
  if (!db) throw new Error("Firestore no disponible");
  return collection(db, TEST_COLLECTION);
};

export const getGlobalTests = async (): Promise<Test[]> => {
  const q = query(testsRef(), where("visibility", "==", "global"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Test);
};

export const getTestsByCreator = async (email: string): Promise<Test[]> => {
  const q = query(testsRef(), where("createdBy", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Test);
};

export const getTestById = async (id: string): Promise<Test | null> => {
  const snap = await getDoc(doc(db!, TEST_COLLECTION, id));
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as Test) : null;
};

export const getTestByCode = async (code: string): Promise<Test | null> => {
  const q = query(testsRef(), where("code", "==", code), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { ...d.data(), id: d.id } as Test;
};

export const getTestsByFolderId = async (folderId: string): Promise<Test[]> => {
  const q = query(testsRef(), where("folderId", "==", folderId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Test);
};

export const saveTestToFirestore = async (
  test: Test,
): Promise<string | null> => {
  const data = {
    ...test,
    visibility: test.visibility || "private",
    code: test.code || "",
  };

  // Remove 'id' to avoid undefined value in Firestore
  const cleanData: Record<string, unknown> = { ...data };
  delete cleanData.id;

  // If test has a valid Firestore ID, update directly
  if (test.id && !test.id.startsWith("test_")) {
    await updateDoc(doc(db!, TEST_COLLECTION, test.id), cleanData);
    return test.id;
  }

  // If has code, check if document already exists
  if (cleanData.code) {
    const existing = await getTestByCode(cleanData.code as string);
    if (existing) {
      await updateDoc(doc(db!, TEST_COLLECTION, existing.id), cleanData);
      return existing.id;
    }
  }

  // Create new document
  const ref = await addDoc(testsRef(), cleanData);
  return ref.id;
};

export const deleteTestFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db!, TEST_COLLECTION, id));
};
