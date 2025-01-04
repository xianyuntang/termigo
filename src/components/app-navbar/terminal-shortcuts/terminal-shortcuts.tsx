import CloseIcon from "@mui/icons-material/Close";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { futureService } from "../../../services";
import { useTerminalStore } from "../../../stores";

const TerminalShortcuts = () => {
  const activeTerminal = useTerminalStore((state) => state.activeTerminal);
  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal,
  );
  const openedTerminals = useTerminalStore((state) => state.openedTerminals);
  const removeTerminal = useTerminalStore((state) => state.removeTerminal);
  const getHost = useTerminalStore((state) => state.getHost);

  const handleShortcutClick = (terminal: string) => {
    setActiveTerminal(terminal);
  };

  const handleCloseClick = async (
    event: React.MouseEvent,
    terminal: string,
  ) => {
    event.stopPropagation();
    event.preventDefault();

    await futureService.stopFuture(terminal);
    setActiveTerminal(null);
    removeTerminal(terminal);
  };

  return (
    <List
      sx={(theme) => ({
        display: "flex",
        overflowX: "hidden",
        gap: theme.spacing(1),
      })}
      dense
      disablePadding
    >
      {openedTerminals.map((terminal) => (
        <ListItem key={terminal} sx={{ whiteSpace: "nowrap" }} disablePadding>
          <ListItemButton
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              borderRadius: theme.spacing(0.5),
              position: "relative",
              "&:hover .MuiListItemIcon-root": {
                visibility: "visible", // hover 时显示 CloseIcon
                opacity: 1, // 配合动画效果
              },
            })}
            onClick={() => handleShortcutClick(terminal)}
            selected={terminal === activeTerminal}
          >
            <ListItemText
              primary={getHost(terminal)?.label || getHost(terminal)?.address}
            ></ListItemText>
            <ListItemIcon
              onClick={(evt) => handleCloseClick(evt, terminal)}
              sx={(theme) => ({
                minWidth: "1em",
                marginLeft: "0.5em",
                opacity: 0,
                transition: "opacity 0.3s ease",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              })}
            >
              <CloseIcon fontSize="small" />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default TerminalShortcuts;
