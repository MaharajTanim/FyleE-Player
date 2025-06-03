/// <reference types="vite/client" />

// File System Access API types
interface FileSystemHandle {
  readonly kind: "file" | "directory";
  readonly name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: "file";
  getFile(): Promise<File>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: "directory";
  values(): AsyncIterableIterator<FileSystemHandle>;
}

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}
