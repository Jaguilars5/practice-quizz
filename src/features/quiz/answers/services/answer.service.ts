import type { AnswerSet } from "@quiz/answers/types/answer.types";
import { ANSWERS_COLLECTION } from "@quiz/constants/quiz.constants";
import { db } from "@shared/services/firebase";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const answersRef = () => {
  if (!db) throw new Error("Firestore no disponible");
  return collection(db, ANSWERS_COLLECTION);
};

export const getAnswersByTest = async (
  testId: string,
): Promise<AnswerSet[]> => {
  const q = query(answersRef(), where("testId", "==", testId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as AnswerSet);
};

export const getAnswersByPlayer = async (
  playerId: string,
): Promise<AnswerSet[]> => {
  const q = query(
    answersRef(),
    where("playerId", "==", playerId),
    orderBy("finishedAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as AnswerSet);
};

export const submitAnswerToFirestore = async (
  answer: AnswerSet,
): Promise<void> => {
  await addDoc(answersRef(), answer);
};
