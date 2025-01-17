import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import TerminalIcon from "@mui/icons-material/Terminal";
import {
  Badge,
  Card,
  CardActions,
  CardHeader,
  IconButton,
  Tooltip,
} from "@mui/material";

import { Host } from "../../../../interfaces";

interface CardProps {
  host: Host;
  onEditClicked?: (host: Host) => void;
  onConnectClicked?: (host: Host) => void;
  onTunnelClicked?: (host: Host) => void;
  portforwardCount?: number;
}

const HostCard = ({
  host,
  onEditClicked,
  onConnectClicked,
  onTunnelClicked,
  portforwardCount,
}: CardProps) => {
  const handleEditClick = () => {
    if (typeof onEditClicked === "function") {
      onEditClicked(host);
    }
  };

  const handleConnectClick = () => {
    if (typeof onConnectClicked === "function") {
      onConnectClicked(host);
    }
  };

  const handleTunnelClick = () => {
    if (typeof onTunnelClicked === "function") {
      onTunnelClicked(host);
    }
  };

  return (
    <Card sx={{ width: "15rem" }}>
      <CardHeader title={host.label} />
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Edit">
          <IconButton onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Port Forward">
          <Badge badgeContent={portforwardCount}>
            <IconButton onClick={handleTunnelClick}>
              <ArrowForwardIcon />
            </IconButton>
          </Badge>
        </Tooltip>
        <Tooltip title="Connect">
          <IconButton onClick={handleConnectClick}>
            <TerminalIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default HostCard;
