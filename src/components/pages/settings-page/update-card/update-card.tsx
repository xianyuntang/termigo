import { Channel } from "@tauri-apps/api/core";
import { error } from "@tauri-apps/plugin-log";
import { RefreshCw, Upload, X } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import {
  DownloadEvent,
  isDownloadProgressEvent,
  UpdateInformation,
} from "../../../../interfaces";
import { settingService } from "../../../../services";
import Card from "../../../shared/card";
import { UpdateFailedNotification } from "./update-failed-notification";

const UpdateCard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [updateInformation, setUpdateInformation] =
    useState<UpdateInformation | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  const isDownloading = downloadProgress !== 0;

  const handleCheckClick = async () => {
    setLoading(true);

    const response = await settingService.checkUpdate();
    setUpdateInformation(response);

    setDialogOpen(true);
    setLoading(false);
  };

  const handleUpdateClick = async () => {
    setDownloadProgress(0.1);
    const event = nanoid();
    const onEvent = new Channel<DownloadEvent>();
    onEvent.onmessage = (evt) => {
      if (isDownloadProgressEvent(evt)) {
        setDownloadProgress(
          (evt.data.downloadedLength / evt.data.contentLength) * 100,
        );
      }
    };
    try {
      await settingService.applyUpdate(event, onEvent);
    } catch {
      await error("Failed to apply update");
      setDownloadProgress(0);
      setNotificationOpen(true);
    }
  };

  const handleCancelClick = async () => {
    setDialogOpen(false);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  return (
    <>
      <Card
        title="Update"
        fullWidth
        actions={
          <Button
            size="sm"
            onClick={handleCheckClick}
            disabled={loading}
            className="w-full"
          >
            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            {!loading && <RefreshCw className="w-4 h-4 mr-2" />}
            Check
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update available</DialogTitle>
          </DialogHeader>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold">New Version</TableCell>
                <TableCell>
                  {updateInformation?.latestVersion || "N/A"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Current Version</TableCell>
                <TableCell>
                  {updateInformation?.currentVersion || "N/A"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {isDownloading && (
            <Progress value={downloadProgress} className="mt-4" />
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={handleUpdateClick}
              disabled={isDownloading || !updateInformation?.canUpdate}
            >
              {isDownloading && (
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
              )}
              {!isDownloading && <Upload className="w-4 h-4 mr-2" />}
              Update
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelClick}
              disabled={isDownloading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpdateFailedNotification
        open={notificationOpen}
        onClose={handleNotificationClose}
      />
    </>
  );
};

export default UpdateCard;
