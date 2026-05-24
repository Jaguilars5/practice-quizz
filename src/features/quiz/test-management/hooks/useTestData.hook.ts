import { logError } from "@app/services/errorLogger";
import {
  getFoldersFromFirestore,
  getLocalFolders,
  getPublicFoldersFromFirestore,
  saveFolderToFirestore,
} from "@folders/services";
import {
  getGlobalTests,
  getLocalTests,
  getTestsByCreator,
  saveTestToFirestore,
  saveTestToLocal,
} from "@quiz/test-management/services";
import type { Test } from "@quiz/test-management/types/test.types";
import { hasFirebaseConfig } from "@shared/services/firebase";
import type { Folder } from "@shared/types";
import { useEffect, useState } from "react";

interface UseTestDataReturn {
  tests: Test[];
  folders: Folder[];
  loading: boolean;
  refreshTests: () => void;
  refreshFolders: () => void;
}

export const useTestData = (
  userEmail: string | undefined,
): UseTestDataReturn => {
  const [tests, setTests] = useState<Test[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFolders = () => setFolders(getLocalFolders());
  const refreshTests = () => setTests(getLocalTests());

  useEffect(() => {
    if (!userEmail) return;
    let mounted = true;

    const load = async () => {
      const localFolders: Folder[] = [];
      const localTests: Test[] = [];

      if (hasFirebaseConfig) {
        try {
          const [fromFs, publicFolders, globalTests, mine] = await Promise.all([
            getFoldersFromFirestore(userEmail),
            getPublicFoldersFromFirestore(),
            getGlobalTests(),
            getTestsByCreator(userEmail),
          ]);

          // ── FOLDERS: Firestore takes precedence ──
          const existingLocalFolders = getLocalFolders();
          const firestoreFolderIds = new Set(
            [...fromFs, ...publicFolders].map((f) => f.id),
          );

          // Keep local-only folders (not in Firestore)
          for (const f of existingLocalFolders) {
            if (!firestoreFolderIds.has(f.id)) {
              localFolders.push(f);
            }
          }
          // Add all Firestore folders
          for (const f of [...fromFs, ...publicFolders]) {
            localFolders.push(f);
          }
          localStorage.setItem("folders", JSON.stringify(localFolders));

          // Upload local-only folders to Firestore
          const localOnlyFolders = existingLocalFolders.filter(
            (f) => !firestoreFolderIds.has(f.id),
          );
          for (const f of localOnlyFolders) {
            try {
              const id = await saveFolderToFirestore(f);
              if (id) {
                const updated = getLocalFolders();
                const idx = updated.findIndex((lf) => lf.id === f.id);
                if (idx >= 0) {
                  updated[idx] = { ...f, id };
                  localStorage.setItem("folders", JSON.stringify(updated));
                }
              }
            } catch (error) {
              logError(error, "useTestData:syncLocalOnlyFolder");
            }
          }

          // ── TESTS: Firestore takes precedence ──
          // Deduplicate Firestore results (a test can be both global AND owned by user)
          const allFirestoreTests = [...globalTests, ...mine];
          const seenCodes = new Set<string>();
          const uniqueFirestoreTests: Test[] = [];
          for (const t of allFirestoreTests) {
            if (!seenCodes.has(t.code)) {
              seenCodes.add(t.code);
              uniqueFirestoreTests.push(t);
            }
          }

          const existingLocalTests = getLocalTests();
          const firestoreTestCodes = new Set(
            uniqueFirestoreTests.map((t) => t.code),
          );

          // Keep local-only tests (not in Firestore)
          for (const t of existingLocalTests) {
            if (!firestoreTestCodes.has(t.code)) {
              localTests.push(t);
            }
          }
          // Always update localStorage with Firestore data
          for (const t of uniqueFirestoreTests) {
            saveTestToLocal(t);
            localTests.push(t);
          }

          // Upload local-only tests to Firestore
          const localOnlyTests = existingLocalTests.filter(
            (t) => !firestoreTestCodes.has(t.code),
          );
          for (const t of localOnlyTests) {
            try {
              const id = await saveTestToFirestore(t);
              if (id) {
                saveTestToLocal({ ...t, id });
              }
            } catch (error) {
              logError(error, "useTestData:syncLocalOnlyTest");
            }
          }
        } catch (error) {
          logError(error, "useTestData:loadFirebaseData");
          setFolders(getLocalFolders());
          setTests(getLocalTests());
          setLoading(false);
          return;
        }
      } else {
        localFolders.push(...getLocalFolders());
        localTests.push(...getLocalTests());
      }

      if (mounted) {
        setFolders(localFolders);
        setTests(localTests);
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [userEmail]);

  return { tests, folders, loading, refreshTests, refreshFolders };
};
