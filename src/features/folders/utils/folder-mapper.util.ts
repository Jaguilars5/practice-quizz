import type { Folder } from "@folders/types/folder.types";

export const mapFolder = (d: {
  id: string;
  data(): Record<string, unknown>;
}): Folder => {
  const data = d.data();
  return {
    id: d.id,
    name: (data.name as string) || "",
    createdBy: (data.createdBy as string) || "",
    createdAt: (data.createdAt as string) || "",
    visibility: (data.visibility as Folder["visibility"]) || "private",
    code: data.code as string | undefined,
  };
};
