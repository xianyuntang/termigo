import EditIcon from "@mui/icons-material/Edit";
import TerminalIcon from "@mui/icons-material/Terminal";
import {
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
}

const HostCard = ({ host, onEditClicked, onConnectClicked }: CardProps) => {
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

  return (
    <Card sx={{ width: "15rem" }}>
      <CardHeader title={host.label} />
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Edit">
          <IconButton onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
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
