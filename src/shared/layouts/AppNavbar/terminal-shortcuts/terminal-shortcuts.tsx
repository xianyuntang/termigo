import { X } from "lucide-react";
import { MouseEvent } from "react";

import { futureService } from "@/core/services";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { useTerminalStore } from "@/stores";

const TerminalShortcuts = () => {
  const activeTerminal = useTerminalStore((state) => state.activeTerminal);
  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal,
  );
  const openedTerminals = useTerminalStore((state) => state.openedTerminals);
  const removeTerminal = useTerminalStore((state) => state.removeTerminal);
  const hostMapper = useTerminalStore((state) => state.hostMapper);

  const handleShortcutClick = (terminal: string) => {
    setActiveTerminal(terminal);
  };

  const handleCloseClick = async (event: MouseEvent, terminal: string) => {
    event.stopPropagation();
    event.preventDefault();

    await futureService.stopFuture(terminal);
    removeTerminal(terminal);
    
    // If we're closing the active terminal, clear the active terminal
    if (activeTerminal === terminal) {
      setActiveTerminal(null);
    }
  };

  return (
    <div className="flex gap-1 overflow-x-auto">
      {openedTerminals.map((terminal) => (
        <div key={terminal} className="whitespace-nowrap">
          <Button
            variant={terminal === activeTerminal ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "group relative h-8 px-3",
              terminal === activeTerminal && "bg-secondary",
            )}
            onClick={() => handleShortcutClick(terminal)}
          >
            <span className="mr-2">
              {hostMapper[terminal]?.label || hostMapper[terminal]?.address}
            </span>
            <button
              className="h-4 w-4 p-0.5 opacity-0 transition-opacity hover:bg-accent rounded-sm group-hover:opacity-100"
              onClick={(evt) => handleCloseClick(evt, terminal)}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default TerminalShortcuts;
