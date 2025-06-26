import { ArrowRight, Edit, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Host } from "../../../../interfaces";

interface CardProps {
  host: Host;
  onEditClicked?: (host: Host) => void;
  onConnectClicked?: (host: Host) => void;
  onTunnelClicked?: (host: Host) => void;
  portforwardCount?: number;
}

const HostCard = ({
  host,
  onEditClicked,
  onConnectClicked,
  onTunnelClicked,
  portforwardCount,
}: CardProps) => {
  const handleEditClick = () => {
    if (typeof onEditClicked === "function") {
      onEditClicked(host);
    }
  };

  const handleConnectClick = () => {
    if (typeof onConnectClicked === "function") {
      onConnectClicked(host);
    }
  };

  const handleTunnelClick = () => {
    if (typeof onTunnelClicked === "function") {
      onTunnelClicked(host);
    }
  };

  return (
    <Card className="w-60">
      <CardHeader>
        <CardTitle>{host.label || host.address}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {host.address}:{host.port}
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={handleTunnelClick}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {portforwardCount ? (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {portforwardCount}
                  </Badge>
                ) : null}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Port Forward</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleConnectClick}>
                <Terminal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Connect</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default HostCard;
