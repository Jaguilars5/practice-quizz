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
  if (data.code) {
    const existing = await getTestByCode(data.code);
    if (existing) {
      await updateDoc(doc(db!, TEST_COLLECTION, existing.id), {
        ...data,
        id: undefined,
      });
      return existing.id;
    }
  }
  const rest = { ...data };
  delete (rest as Record<string, unknown>).id;
  const ref = await addDoc(testsRef(), rest);
  return ref.id;
};

export const deleteTestFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db!, TEST_COLLECTION, id));
};
