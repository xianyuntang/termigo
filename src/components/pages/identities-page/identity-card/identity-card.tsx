import EditIcon from "@mui/icons-material/Edit";
import {
  Card,
  CardActions,
  CardHeader,
  IconButton,
  Tooltip,
} from "@mui/material";

import { Identity } from "../../../../interfaces";

interface IdentityCardProps {
  identity: Identity;
  onEditClicked?: (identity: Identity) => void;
}

const IdentityCard = ({ identity, onEditClicked }: IdentityCardProps) => {
  const handleEditClick = () => {
    if (typeof onEditClicked === "function") {
      onEditClicked(identity);
    }
  };

  return (
    <Card sx={{ width: "15rem" }}>
      <CardHeader title={identity.label} />
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

export default IdentityCard;
