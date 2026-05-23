import { ROUTES } from "@app/constants/routes";
import { logError } from "@app/services/errorLogger";
import {
  getLocalTestByCode,
  getLocalTests,
  getTestByCode,
  saveTestToLocal,
} from "@quiz/test-management/services";
import type { Test } from "@quiz/test-management/types/test.types";
import { hasFirebaseConfig } from "@shared/services/firebase";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UseTestSearchReturn {
  searchCode: string;
  setSearchCode: (code: string) => void;
  searching: boolean;
  searchError: string;
  handleSearch: () => Promise<void>;
}

export const useTestSearch = (
  onTestFound: (tests: Test[]) => void,
): UseTestSearchReturn => {
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = useCallback(async () => {
    const code = searchCode.trim().toUpperCase();
    if (!code) return;

    setSearching(true);
    setSearchError("");

    const local = getLocalTestByCode(code);
    if (local) {
      navigate(ROUTES.PLAY(local.id));
      return;
    }

    if (hasFirebaseConfig) {
      try {
        const found = await getTestByCode(code);
        if (found) {
          saveTestToLocal(found);
          onTestFound(getLocalTests());
          navigate(ROUTES.PLAY(found.id));
          return;
        }
      } catch (error) {
        logError(error, "useTestSearch:handleSearch");
        setSearchError("Error al buscar en Firestore");
        setSearching(false);
        return;
      }
    }

    setSearchError("No se encontró ningún test con ese código");
    setSearching(false);
  }, [searchCode, navigate, onTestFound]);

  return { searchCode, setSearchCode, searching, searchError, handleSearch };
};
