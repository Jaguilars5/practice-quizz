import type { Folder as FolderType } from "@folders/types/folder.types";
import { Plus } from "lucide-react";
import { FolderItem } from "./FolderItem";

interface FolderListProps {
  folders: (FolderType & { count: number })[];
  activeFolder: string | null;
  currentUserEmail: string;
  onSelectFolder: (id: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onUpdateVisibility: (
    id: string,
    visibility: FolderType["visibility"],
    code?: string,
  ) => void;
  onNewFolder: () => void;
}

export const FolderList = ({
  folders,
  activeFolder,
  currentUserEmail,
  onSelectFolder,
  onRenameFolder,
  onDeleteFolder,
  onUpdateVisibility,
  onNewFolder,
}: FolderListProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
          Carpetas
        </span>
        <button
          onClick={onNewFolder}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Nueva carpeta"
        >
          <Plus size={14} />
        </button>
      </div>
      <FolderItem
        name="Todos"
        count={folders.reduce((s, f) => s + f.count, 0)}
        visibility="private"
        isActive={activeFolder === null}
        isOwn={false}
        onSelect={() => onSelectFolder(null)}
        onRename={() => {}}
        onDelete={() => {}}
        onUpdateVisibility={() => {}}
      />
      {folders.map((f) => (
        <FolderItem
          key={f.id}
          name={f.name}
          count={f.count}
          visibility={f.visibility}
          code={f.code}
          isActive={activeFolder === f.id}
          isOwn={f.createdBy === currentUserEmail}
          onSelect={() => onSelectFolder(f.id)}
          onRename={(name) => onRenameFolder(f.id, name)}
          onDelete={() => onDeleteFolder(f.id)}
          onUpdateVisibility={(v, c) => onUpdateVisibility(f.id, v, c)}
        />
      ))}
    </div>
  );
};
