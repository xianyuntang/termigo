import CloseIcon from "@mui/icons-material/Close";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import UpdateIcon from "@mui/icons-material/Update";
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Channel } from "@tauri-apps/api/core";
import { nanoid } from "nanoid";
import { useState } from "react";

import {
  DownloadEvent,
  isDownloadProgressEvent,
  UpdateInformation,
} from "../../../../interfaces";
import { settingService } from "../../../../services";
import Card from "../../../shared/card";

const UpdateCard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [updateInformation, setUpdateInformation] =
    useState<UpdateInformation | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const isDownloading = downloadProgress !== 0;

  const handleCheckClick = async () => {
    setLoading(true);
    const response = await settingService.checkUpdate();
    setUpdateInformation(response);

    setDialogOpen(true);
    setLoading(false);
  };

  const handleUpdateClick = async () => {
    const event = nanoid();
    const onEvent = new Channel<DownloadEvent>();
    onEvent.onmessage = (evt) => {
      if (isDownloadProgressEvent(evt)) {
        setDownloadProgress(
          (evt.data.downloadedLength / evt.data.contentLength) * 100,
        );
      }
    };

    await settingService.applyUpdate(event, onEvent);
  };

  const handleCancelClick = async () => {
    setLoading(false);
    setDialogOpen(false);
  };

  return (
    <>
      <Card
        title="Update"
        fullWidth
        actions={
          <ButtonGroup fullWidth size="small">
            <Button
              endIcon={<UpdateIcon />}
              loadingPosition="start"
              loading={loading}
              onClick={handleCheckClick}
            >
              check
            </Button>
          </ButtonGroup>
        }
      ></Card>
      <Dialog open={dialogOpen}>
        <DialogTitle>Update available</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    New Version
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {updateInformation?.newVersion || "N/A"}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    Current Version
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {updateInformation?.currentVersion || "N/A"}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <LinearProgress
            variant="determinate"
            value={downloadProgress}
          ></LinearProgress>
        </DialogContent>
        <DialogActions>
          <ButtonGroup fullWidth>
            <Button
              color="error"
              endIcon={<SystemUpdateAltIcon />}
              onClick={handleUpdateClick}
              loading={isDownloading}
              disabled={!updateInformation?.canUpdate}
            >
              update
            </Button>
            <Button
              endIcon={<CloseIcon />}
              onClick={handleCancelClick}
              loading={isDownloading}
            >
              cancel
            </Button>
          </ButtonGroup>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateCard;
