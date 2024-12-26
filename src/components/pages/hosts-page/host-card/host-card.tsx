import { Button, Card as _Card, CardActions, CardHeader } from "@mui/material";

import { Host } from "../../../../interfaces";

interface CardProps {
  host: Host;
  onEditClicked?: (host: Host) => void;
  onConnectClicked?: (host: Host) => void;
}

const HostCard = ({ host, onEditClicked, onConnectClicked }: CardProps) => {
  const handleEditClick = (host: Host) => {
    if (typeof onEditClicked === "function") {
      onEditClicked(host);
    }
  };

  const handleConnectClick = (host: Host) => {
    if (typeof onConnectClicked === "function") {
      onConnectClicked(host);
    }
  };

  return (
    <_Card sx={{ width: "15rem" }}>
      <CardHeader title={host.label} />

      <CardActions>
        <Button onClick={() => handleEditClick(host)}>edit</Button>
        <Button onClick={() => handleConnectClick(host)}>connect</Button>
      </CardActions>
    </_Card>
  );
};

export default HostCard;
