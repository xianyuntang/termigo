import { Dialog, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { KeyboardEvent } from "react";

interface AgentDialog {
  open: boolean;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

const AgentDialog = ({ open, onClose, onSubmit }: AgentDialog) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [inputText, setInputText] = useState<string>("");

  useEffect(() => {
    if (open) {
      ref?.focus();
      setInputText("");
    }
  }, [ref, open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit(inputText);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "30em" } }}
    >
      <TextField
        inputRef={setRef}
        size="small"
        placeholder="Describe what you want to do"
        autoCapitalize="off"
        autoComplete="off"
        fullWidth
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        value={inputText}
      />
    </Dialog>
  );
};

export default AgentDialog;
