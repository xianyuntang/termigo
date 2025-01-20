import { Alert, Snackbar } from "@mui/material";

interface UpdateNotificationProps {
  open: boolean;
  onClose: () => void;
}

export const UpdateFailedNotification = ({
  open,
  onClose,
}: UpdateNotificationProps) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
    >
      <Alert
        onClose={onClose}
        severity="error"
        variant="filled"
        sx={{ width: "100%" }}
      >
        Failed to apply update
      </Alert>
    </Snackbar>
  );
};
