import { useEffect } from "react";

import { useToast } from "@/hooks/use-toast";

interface UpdateNotificationProps {
  open: boolean;
  onClose: () => void;
}

export const UpdateFailedNotification = ({
  open,
  onClose,
}: UpdateNotificationProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      toast({
        title: "Update Failed",
        description: "Failed to apply update",
        variant: "destructive",
      });

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, onClose, toast]);

  return null;
};
