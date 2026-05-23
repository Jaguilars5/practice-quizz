import type { Test } from "@quiz/test-management/types/test.types";
import { Button } from "@shared/components/ui/Button";
import { importTestFromJson } from "@shared/utils/jsonImporter";
import { Upload } from "lucide-react";

interface JsonImporterProps {
  onImport: (test: Test) => void;
}

export const JsonImporter = ({ onImport }: JsonImporterProps) => {
  const handleImport = async () => {
    try {
      const test = await importTestFromJson();
      onImport(test);
    } catch {
      // user cancelled or error
    }
  };

  return (
    <Button variant="secondary" onClick={handleImport}>
      <Upload size={16} /> Importar JSON
    </Button>
  );
};
