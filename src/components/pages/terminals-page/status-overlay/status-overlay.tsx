import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";

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
      <Box sx={{ top: "35%", position: "absolute" }}>
        {status === StatusType.NewPublicKeyFound ? (
          <Typography>New fingerprint found!!</Typography>
        ) : (
          <Typography>{status}</Typography>
        )}
      </Box>
      <Box sx={{ width: "50%" }}>
        {status === StatusType.NewPublicKeyFound && (
          <Typography sx={{ wordBreak: "break-all" }}>{fingerprint}</Typography>
        )}
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
