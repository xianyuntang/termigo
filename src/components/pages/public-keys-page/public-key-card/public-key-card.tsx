import EditIcon from "@mui/icons-material/Edit";
import {
  Card,
  CardActions,
  CardHeader,
  IconButton,
  Tooltip,
} from "@mui/material";

import { PublicKey } from "../../../../interfaces";

interface CardProps {
  publicKey: PublicKey;
  onEditClicked?: (publicKey: PublicKey) => void;
}

const PublicKeyCard = ({ publicKey, onEditClicked }: CardProps) => {
  const handleEditClick = () => {
    if (typeof onEditClicked === "function") {
      onEditClicked(publicKey);
    }
  };

  return (
    <Card sx={{ width: "15rem" }}>
      <CardHeader title={publicKey.label} />
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Edit">
          <IconButton onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default PublicKeyCard;
