import ComputerIcon from "@mui/icons-material/Computer";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const SideMenu = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const navigate = useNavigate();

  const items = [
    { icon: <ComputerIcon />, text: "Hosts", url: "/hosts" },
    { icon: <PermIdentityIcon />, text: "Identities", url: "/identities" },
  ];

  const handleClick = (index: number, url: string) => {
    navigate({ to: url });
    setActiveIndex(index);
  };

  return (
    <Drawer variant="permanent">
      <List dense>
        {items.map((item, index) => (
          <ListItem
            key={index}
            sx={{
              display: "block",
            }}
          >
            <ListItemButton
              sx={(theme) => {
                return {
                  borderRadius: theme.shape.borderRadius,
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
