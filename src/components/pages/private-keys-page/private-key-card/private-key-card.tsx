import EditIcon from "@mui/icons-material/Edit";
import {
  Card,
  CardActions,
  CardHeader,
  IconButton,
  Tooltip,
} from "@mui/material";

import { PrivateKey } from "../../../../interfaces";

interface CardProps {
  privateKey: PrivateKey;
  onEditClicked?: (privateKey: PrivateKey) => void;
}

const PrivateKeyCard = ({ privateKey, onEditClicked }: CardProps) => {
  const handleEditClick = () => {
    if (typeof onEditClicked === "function") {
      onEditClicked(privateKey);
    }
  };

  return (
    <Card sx={{ width: "15rem" }}>
      <CardHeader title={privateKey.label} />
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

export default PrivateKeyCard;
