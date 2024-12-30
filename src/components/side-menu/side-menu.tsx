import ComputerIcon from "@mui/icons-material/Computer";
import KeyIcon from "@mui/icons-material/Key";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import {
  Drawer,
  drawerClasses,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useTerminalStore } from "../../stores";

const SideMenu = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal
  );

  const navigate = useNavigate();

  const items = [
    { icon: <ComputerIcon />, text: "Hosts", url: "/hosts" },
    { icon: <PermIdentityIcon />, text: "Identities", url: "/identities" },
    { icon: <KeyIcon />, text: "Public Keys", url: "/public-keys" },
  ];

  const handleClick = (index: number, url: string) => {
    navigate({ to: url });
    setActiveIndex(index);
    setActiveTerminal(null);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: "block",
        width: "12rem",
        height: "100vh",
        [`& .${drawerClasses.paper}`]: {
          width: "12rem",
        },
      }}
    >
      <List
        dense
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "8px",
          gap: theme.spacing(1),
        })}
      >
        {items.map((item, index) => (
          <ListItem
            key={index}
            sx={{
              display: "block",
            }}
            disablePadding
          >
            <ListItemButton
              sx={(theme) => {
                return {
                  borderRadius: theme.spacing(0.5),
                };
              }}
              selected={index === activeIndex}
              onClick={() => handleClick(index, item.url)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SideMenu;
