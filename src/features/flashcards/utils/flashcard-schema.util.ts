import * as yup from "yup";

export const flashcardSetSchema = yup.object({
  title: yup
    .string()
    .required("El título es obligatorio")
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),
  description: yup.string().notRequired().max(300, "Máximo 300 caracteres"),
  visibility: yup
    .mixed<"global" | "private">()
    .oneOf(["global", "private"])
    .default("private"),
  code: yup
    .string()
    .length(6, "El código debe tener 6 caracteres")
    .matches(/^[A-Z0-9]+$/, "Solo letras y números"),
  shuffleCards: yup.boolean().default(false),
  folderId: yup.string().notRequired(),
});

export const defaultFlashcardSetValues = {
  title: "",
  description: "",
  visibility: "private" as const,
  code: "",
  shuffleCards: false,
  folderId: undefined,
};

export const mapFlashcardSetToFormValues = (set?: {
  title?: string;
  description?: string;
  visibility?: "global" | "private";
  code?: string;
  shuffleCards?: boolean;
  folderId?: string;
}) => ({
  title: set?.title || "",
  description: set?.description || "",
  visibility: set?.visibility || ("private" as const),
  code: set?.code || generateCode(),
  shuffleCards: set?.shuffleCards || false,
  folderId: set?.folderId || undefined,
});

export const generateCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export type FlashcardSetFormValues = yup.InferType<typeof flashcardSetSchema>;
