import CloseIcon from "@mui/icons-material/Close";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { useTerminalStore } from "../../../stores";

const TerminalShortcuts = () => {
  const activeTerminal = useTerminalStore((state) => state.activeTerminal);
  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal
  );
  const openedTerminals = useTerminalStore((state) => state.openedTerminals);
  const removeTerminal = useTerminalStore((state) => state.removeTerminal);

  const handleShortcutClick = (terminal: string) => {
    setActiveTerminal(terminal);
  };

  const handleCloseClick = (event: React.MouseEvent, terminal: string) => {
    event.stopPropagation();
    event.preventDefault();
    setActiveTerminal(null);
    removeTerminal(terminal);
  };

  return (
    <List
      sx={(theme) => ({
        display: "flex",
        overflowX: "scroll",
        gap: theme.spacing(1),
      })}
      dense
      disablePadding
    >
      {openedTerminals.map((terminal) => (
        <ListItem
          key={terminal}
          sx={{ whiteSpace: "nowrap", display: "block" }}
          disablePadding
        >
          <ListItemButton
            sx={(theme) => {
              return {
                borderRadius: theme.spacing(0.5),
              };
            }}
            onClick={() => handleShortcutClick(terminal)}
            selected={terminal === activeTerminal}
          >
            <ListItemIcon onClick={(evt) => handleCloseClick(evt, terminal)}>
              <CloseIcon />
            </ListItemIcon>
            <ListItemText primary={terminal}></ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default TerminalShortcuts;
