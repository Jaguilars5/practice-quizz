export interface Folder {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  visibility: "private" | "public" | "code";
  code?: string;
}
