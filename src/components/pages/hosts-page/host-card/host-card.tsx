import { ArrowRight, Edit, Server, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-card border-border">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {host.label || host.address}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {host.address}:{host.port}
              </CardDescription>
            </div>
          </div>
          {portforwardCount ? (
            <Badge variant="secondary" className="ml-2">
              {portforwardCount} tunnel{portforwardCount > 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Status:</span>
            <Badge variant="outline" className="text-xs">
              Ready
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted border-t border-border px-6 py-3">
        <div className="flex w-full items-center justify-between">
          <Button
            variant="default"
            size="sm"
            onClick={handleConnectClick}
            className="gap-2"
          >
            <Terminal className="h-4 w-4" />
            Connect
          </Button>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleTunnelClick}
                    className="h-8 w-8"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Port Forward</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEditClick}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HostCard;
