import { Box } from "@mui/material";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

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
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed #cccccc",
        borderRadius: "4px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        transition: "border 0.3s ease-in-out",
        "&:hover": {
          borderColor: "#666666",
        },
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>{text || "Drag and drop file here, or click to select file"}</p>
      )}
    </Box>
  );
};

export default Dropzone;
