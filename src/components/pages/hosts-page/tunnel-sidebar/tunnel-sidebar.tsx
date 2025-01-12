import { zodResolver } from "@hookform/resolvers/zod";
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
import { z } from "zod";

import { Portforward } from "../../../../stores";
import Card from "../../../shared/card";

interface TunnelDialogProps {
  portforwards?: Portforward[];
  isOpen: boolean;
  onTunnelStart?: (form: TunnelSchema) => void;
  onTunnelStop?: (tunnel: string) => void;
  onClose?: () => void;
}

const tunnelSchema = z.object({
  localAddress: z.string(),
  localPort: z
    .string()
    .nonempty()
    .refine((value) => !isNaN(Number(value)), {
      message: "Must be a valid number",
    }),
  destinationAddress: z.string(),
  destinationPort: z
    .string()
    .nonempty()
    .refine((value) => !isNaN(Number(value)), {
      message: "Must be a valid number",
    }),
});

export type TunnelSchema = z.infer<typeof tunnelSchema>;

const TunnelDialog = ({
  portforwards,
  isOpen,
  onTunnelStart,
  onTunnelStop,
  onClose,
}: TunnelDialogProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TunnelSchema>({
    defaultValues: {
      localAddress: "127.0.0.1",
      localPort: "",
      destinationAddress: "127.0.0.1",
      destinationPort: "",
    },
    resolver: zodResolver(tunnelSchema),
    reValidateMode: "onChange",
  });

  const destinationPort = watch("destinationPort");

  useEffect(() => {
    setValue("localPort", destinationPort);
  }, [setValue, destinationPort]);

  const onSubmit: SubmitHandler<TunnelSchema> = async (data) => {
    if (typeof onTunnelStart === "function") {
      onTunnelStart(data);
    }
  };

  const handleCloseClick = () => {
    if (typeof onClose === "function") {
      onClose();
    }
    reset();
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
        <Card title="Port Forward">
          <Controller
            name="destinationAddress"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Destination Address"
                  size="small"
                  slotProps={{
                    input: {
                      autoCapitalize: "none",
                      spellCheck: false,
                      autoComplete: "off",
                    },
                  }}
                  error={!!errors.destinationAddress}
                  helperText={errors.destinationAddress?.message}
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
                  slotProps={{
                    input: {
                      autoCapitalize: "none",
                      spellCheck: false,
                      autoComplete: "off",
                    },
                  }}
                  error={!!errors.destinationPort}
                  helperText={errors.destinationPort?.message}
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
                  slotProps={{
                    input: {
                      autoCapitalize: "none",
                      spellCheck: false,
                      autoComplete: "off",
                    },
                  }}
                  error={!!errors.localAddress}
                  helperText={errors.localAddress?.message}
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
                  slotProps={{
                    input: {
                      autoCapitalize: "none",
                      spellCheck: false,
                      autoComplete: "off",
                    },
                  }}
                  error={!!errors.localPort}
                  helperText={errors.localPort?.message}
                />
              </FormControl>
            )}
          />
        </Card>
        <ButtonGroup
          fullWidth
          size="small"
          sx={{ float: "right", display: "flex", justifyContent: "flex-end" }}
        >
          <Button endIcon={<StartIcon />} onClick={handleSubmit(onSubmit)}>
            start
          </Button>
        </ButtonGroup>

        <Card title="Current forwarding">
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
        </Card>
      </Box>
    </Drawer>
  );
};

export default TunnelDialog;
