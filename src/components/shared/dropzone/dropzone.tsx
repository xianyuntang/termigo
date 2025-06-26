import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

interface DropzoneProps {
  text?: string;
  onFilesDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
}

const Dropzone = ({
  text,
  onFilesDrop,
  accept,
  maxFiles = 1,
}: DropzoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesDrop(acceptedFiles);
    },
    [onFilesDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-muted-foreground/25 rounded-md p-5 text-center cursor-pointer transition-colors",
        "hover:border-muted-foreground/50",
        isDragActive && "border-primary"
      )}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-sm text-muted-foreground">Drop the file here...</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {text || "Drag and drop file here, or click to select file"}
        </p>
      )}
    </div>
  );
};

export default Dropzone;
