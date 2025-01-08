import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useMemo } from "react";

import { ERROR_STATUS } from "../terminal-view/constant.ts";
import { StatusType } from "../terminal-view/interface.ts";

interface StatusDialogProps {
  title: string;
  open: boolean;
  status: StatusType;
  onReconnect: () => void;
  onClose: () => void;
}

const StatusDialog = ({
  title,
  status,
  open,
  onReconnect,
  onClose,
}: StatusDialogProps) => {
  const progress = useMemo(() => {
    switch (status) {
      case StatusType.Pending:
        return 0;
      case StatusType.Connecting:
        return 25;
      case StatusType.Connected:
        return 50;
      case StatusType.ChannelOpened:
        return 75;
      case StatusType.StartStreaming:
        return 100;
      default:
        return 0;
    }
  }, [status]);

  const handleReconnectClick = async () => {
    onReconnect();
  };

  const handleCloseClick = async () => {
    onClose();
  };

  return (
    <Dialog open={open}>
      <Box sx={{ width: "fit" }}>
        <DialogTitle>Trying to connect to {title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <LinearProgress
              color={ERROR_STATUS.includes(status) ? "error" : "primary"}
              variant="determinate"
              value={progress}
            />
            <Typography component="span" variant="body2">
              {status}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!ERROR_STATUS.includes(status)}
            endIcon={<ReplayIcon />}
            onClick={handleReconnectClick}
          >
            retry
          </Button>
          <Button
            disabled={!ERROR_STATUS.includes(status)}
            color="error"
            endIcon={<CloseIcon />}
            onClick={handleCloseClick}
          >
            close
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default StatusDialog;
