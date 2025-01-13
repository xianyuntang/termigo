import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

const ConfirmDialog = ({ open, onClose, onConfirm }: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm action</DialogTitle>
      <DialogContent>This action cannot be undone.</DialogContent>
      <DialogActions>
        <ButtonGroup>
          <Button onClick={onConfirm} color="error">
            confirm
          </Button>
          <Button onClick={onClose}>cancel</Button>
        </ButtonGroup>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
