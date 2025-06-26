import { useEffect, useState } from "react";
import { KeyboardEvent } from "react";

import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";

interface AgentDialogProps {
  open: boolean;
  onSubmit: (_text: string) => void;
  onClose: () => void;
}

export const AgentDialog = ({ open, onClose, onSubmit }: AgentDialogProps) => {
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[480px] p-2">
        <Input
          ref={setRef}
          placeholder="Describe what you want to do"
          autoCapitalize="off"
          autoComplete="off"
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          value={inputText}
          className="w-full"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AgentDialog;
