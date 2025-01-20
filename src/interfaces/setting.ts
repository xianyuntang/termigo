export interface UpdateInformation {
  canUpdate: boolean;
  newVersion?: string;
  currentVersion: string;
}

export interface DownloadProgressEvent {
  event: "progress";
  data: {
    downloadedLength: number;
    contentLength: number;
  };
}

export interface DownloadFinishedEvent {
  event: "finished";
}

export type DownloadEvent = DownloadProgressEvent | DownloadFinishedEvent;

export const isDownloadProgressEvent = (
  event: DownloadEvent,
): event is DownloadProgressEvent => {
  return event.event === "progress";
};
