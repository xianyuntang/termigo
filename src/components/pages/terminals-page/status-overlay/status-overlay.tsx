import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Box,
  Button,
  ButtonGroup,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useMemo } from "react";

import { ERROR_STATUS } from "../terminal-view/constant.ts";
import { StatusType } from "../terminal-view/interface.ts";

interface StatusOverlayProps {
  fingerprint: string | null;
  open: boolean;
  status: StatusType;
  onReconnect: () => void;
  onClose: () => void;
  onPublicKeyConfirm: (confirm: boolean) => void;
}

const StatusOverlay = ({
  fingerprint,
  status,
  open,
  onReconnect,
  onClose,
  onPublicKeyConfirm,
}: StatusOverlayProps) => {
  const progress = useMemo(() => {
    switch (status) {
      case StatusType.Pending:
        return 0;
      case StatusType.Connecting:
        return 25;
      case StatusType.NewPublicKeyFound:
      case StatusType.PublicKeyVerified:
        return 37.5;
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

  const handlePublicKeyConfirm = async (confirm: boolean) => {
    if (fingerprint) {
      onPublicKeyConfirm(confirm);
    }
  };
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: open ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box sx={{ width: "50%", top: "20%", position: "absolute" }}>
        {status === StatusType.NewPublicKeyFound ? (
          <Typography>New fingerprint found!!</Typography>
        ) : (
          <Typography>{status}</Typography>
        )}
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Box sx={{ width: "50%" }}>
        <Typography sx={{ wordBreak: "break-all", marginTop: 2 }}>
          {fingerprint}
        </Typography>
      </Box>

      <Box sx={(theme) => ({ marginTop: theme.spacing(2), width: "50%" })}>
        {status === StatusType.NewPublicKeyFound && (
          <ButtonGroup fullWidth>
            <Button
              color="error"
              endIcon={<CloseIcon />}
              onClick={() => handlePublicKeyConfirm(false)}
            >
              decline
            </Button>
            <Button
              endIcon={<AddIcon />}
              onClick={() => handlePublicKeyConfirm(true)}
            >
              accept
            </Button>
          </ButtonGroup>
        )}

        {ERROR_STATUS.includes(status) && (
          <ButtonGroup fullWidth>
            <Button
              color="error"
              endIcon={<CloseIcon />}
              onClick={handleCloseClick}
            >
              close
            </Button>
            <Button endIcon={<ReplayIcon />} onClick={handleReconnectClick}>
              retry
            </Button>
          </ButtonGroup>
        )}
      </Box>
    </Box>
  );
};

export default StatusOverlay;
