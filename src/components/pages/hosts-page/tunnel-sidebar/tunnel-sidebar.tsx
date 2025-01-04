import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClearIcon from "@mui/icons-material/Clear";
import StartIcon from "@mui/icons-material/Start";
import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  FormControl,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { Portforward } from "../../../../stores";
import SidebarCard from "../../../shared/sidebar-card";

interface TunnelDialogProps {
  portforwards?: Portforward[];
  isOpen: boolean;
  onTunnelStart?: (form: StartTunnelForm) => void;
  onTunnelStop?: (tunnel: string) => void;
  onClose?: () => void;
}

export interface StartTunnelForm {
  localAddress: string;
  localPort: string;
  destinationAddress: string;
  destinationPort: string;
}

const TunnelDialog = ({
  portforwards,
  isOpen,
  onTunnelStart,
  onTunnelStop,
  onClose,
}: TunnelDialogProps) => {
  const { control, handleSubmit, watch, setValue } = useForm<StartTunnelForm>({
    defaultValues: {
      localAddress: "127.0.0.1",
      localPort: "",
      destinationAddress: "127.0.0.1",
      destinationPort: "",
    },
  });

  const destinationPort = watch("destinationPort");

  useEffect(() => {
    setValue("localPort", destinationPort);
  }, [setValue, destinationPort]);

  const onSubmit: SubmitHandler<StartTunnelForm> = async (data) => {
    if (typeof onTunnelStart === "function") {
      onTunnelStart(data);
    }
  };

  const handleCloseClick = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleStopPortforward = (tunnel: string) => {
    if (typeof onTunnelStop === "function") {
      onTunnelStop(tunnel);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={handleCloseClick}
      anchor="right"
      PaperProps={{
        sx: {
          width: "22rem",
        },
      }}
    >
      <Box
        sx={(theme) => ({
          padding: theme.spacing(2),
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(2),
        })}
      >
        <SidebarCard title="Port Forward">
          <Controller
            name="destinationAddress"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Destination Address"
                  size="small"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </FormControl>
            )}
          />
          <Controller
            name="destinationPort"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Destination Port"
                  size="small"
                  type="number"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </FormControl>
            )}
          />
          <Controller
            name="localAddress"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Local Address"
                  size="small"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </FormControl>
            )}
          />
          <Controller
            name="localPort"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Local Port"
                  size="small"
                  type="number"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </FormControl>
            )}
          />
        </SidebarCard>
        <ButtonGroup
          size="small"
          sx={{ float: "right", display: "flex", justifyContent: "flex-end" }}
        >
          <Button endIcon={<StartIcon />} onClick={handleSubmit(onSubmit)}>
            start
          </Button>
        </ButtonGroup>

        <SidebarCard title="Current forwarding">
          <List dense>
            {portforwards?.map((pf) => (
              <ListItem key={pf.tunnel} disablePadding>
                <ListItemButton
                  disableRipple
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <ListItemText>
                    {pf.localAddress}:{pf.localPort}
                  </ListItemText>
                  <ListItemIcon sx={{ minWidth: "1em" }}>
                    <ArrowForwardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>
                    {pf.destinationAddress}:{pf.destinationPort}
                  </ListItemText>

                  <ListItemIcon
                    onClick={() => handleStopPortforward(pf.tunnel)}
                    sx={(theme) => ({
                      minWidth: "1em",
                      marginLeft: "0.5em",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    })}
                  >
                    <ClearIcon fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </SidebarCard>
      </Box>
    </Drawer>
  );
};

export default TunnelDialog;
