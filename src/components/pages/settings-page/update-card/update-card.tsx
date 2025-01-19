import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import UpdateIcon from "@mui/icons-material/Update";
import { Button, ButtonGroup } from "@mui/material";
import { useState } from "react";

import { settingService } from "../../../../services";
import Card from "../../../shared/card";

const UpdateCard = () => {
  const [canUpdate, setCanUpdate] = useState<boolean>(false);

  const handleCheckClick = async () => {
    await settingService.checkUpdate();
    setCanUpdate(true);
  };

  return (
    <Card
      title="Update"
      fullWidth
      actions={
        <ButtonGroup fullWidth size="small">
          <Button endIcon={<UpdateIcon />} onClick={handleCheckClick}>
            check
          </Button>
          <Button
            color="error"
            endIcon={<SystemUpdateAltIcon />}
            disabled={!canUpdate}
          >
            update
          </Button>
        </ButtonGroup>
      }
    ></Card>
  );
};

export default UpdateCard;
