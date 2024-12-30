import CloseIcon from "@mui/icons-material/Close";
import StartIcon from "@mui/icons-material/Start";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

interface TunnelDialogProps {
  isOpen: boolean;
  onTunnelStart?: (form: StartTunnelForm) => void;
  onClose?: () => void;
}

export interface StartTunnelForm {
  localAddress: string;
  localPort: string;
  destinationAddress: string;
  destinationPort: string;
}

const TunnelDialog = ({
  isOpen,
  onTunnelStart,
  onClose,
}: TunnelDialogProps) => {
  const { control, handleSubmit } = useForm<StartTunnelForm>({
    defaultValues: {
      localAddress: "127.0.0.1",
      localPort: "",
      destinationAddress: "127.0.0.1",
      destinationPort: "",
    },
  });

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

  return (
    <Dialog open={isOpen}>
      <DialogTitle>Port Forward</DialogTitle>
      <DialogContent>
        <Box
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.spacing(2),
            width: "20rem",
            height: "15rem",
          })}
        >
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button endIcon={<StartIcon />} onClick={handleSubmit(onSubmit)}>
          start
        </Button>
        <Button
          color="error"
          endIcon={<CloseIcon />}
          onClick={handleCloseClick}
        >
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TunnelDialog;
