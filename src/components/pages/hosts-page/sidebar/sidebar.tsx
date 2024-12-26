import TerminalIcon from "@mui/icons-material/Terminal";
import { Box, Button, Drawer, FormControl, TextField } from "@mui/material";

import SidebarCard from "../../../shared/sidebar-card";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onClose={handleClose} anchor="right">
      <Box
        sx={(theme) => ({
          padding: theme.spacing(2),
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(2),
        })}
      >
        <SidebarCard title="General">
          <FormControl fullWidth>
            <TextField label="Label" size="small" fullWidth />
          </FormControl>
          <FormControl fullWidth>
            <TextField label="Tags" size="small" fullWidth />
          </FormControl>
        </SidebarCard>

        <SidebarCard title="Connection Information">
          <FormControl fullWidth>
            <TextField label="Address" size="small" fullWidth />
          </FormControl>
          <FormControl fullWidth>
            <TextField label="Port" size="small" type="number" fullWidth />
          </FormControl>
        </SidebarCard>

        <SidebarCard title="Identity">
          <FormControl fullWidth>
            <TextField label="Username" size="small" fullWidth />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              label="Password"
              size="small"
              type="password"
              fullWidth
            />
          </FormControl>
        </SidebarCard>

        <FormControl fullWidth>
          <Button startIcon={<TerminalIcon />}>Connect</Button>
        </FormControl>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
