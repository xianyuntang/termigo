import { Plus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ERROR_STATUS, StatusType } from "../terminal-view/constant.ts";

interface StatusOverlayProps {
  fingerprint: string | null;
  open: boolean;
  status: StatusType;
  onReconnect: () => void;
  onClose: () => void;
  onPublicKeyConfirm: (confirm: boolean) => void;
}

const StatusOverlay = ({
  fingerprint,
  status,
  open,
  onReconnect,
  onClose,
  onPublicKeyConfirm,
}: StatusOverlayProps) => {
  const handleReconnectClick = async () => {
    onReconnect();
  };

  const handleCloseClick = async () => {
    onClose();
  };

  const handlePublicKeyConfirm = async (confirm: boolean) => {
    if (fingerprint) {
      onPublicKeyConfirm(confirm);
    }
  };
  return (
    <div
      className={`relative w-full h-full ${open ? "flex" : "hidden"} justify-center items-center flex-col`}
    >
      <div className="absolute top-[35%]">
        {status === StatusType.NewPublicKeyFound ? (
          <p className="text-lg">New fingerprint found!!</p>
        ) : (
          <p className="text-lg">{status}</p>
        )}
      </div>
      <div className="w-1/2">
        {status === StatusType.NewPublicKeyFound && (
          <p className="break-all font-mono text-sm">{fingerprint}</p>
        )}
      </div>

      <div className="mt-4 w-1/2">
        {status === StatusType.NewPublicKeyFound && (
          <div className="flex gap-2 w-full">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handlePublicKeyConfirm(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              className="flex-1"
              onClick={() => handlePublicKeyConfirm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>
        )}

        {ERROR_STATUS.includes(status) && (
          <div className="flex gap-2 w-full">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCloseClick}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button className="flex-1" onClick={handleReconnectClick}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusOverlay;
