import { Edit, Key, Shield, User } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Identity } from "@/types/interfaces";

interface IdentityCardProps {
  identity: Identity;
  onEditClicked?: (_identity: Identity) => void;
}

const IdentityCard = ({ identity, onEditClicked }: IdentityCardProps) => {
  const handleEditClick = () => {
    if (typeof onEditClicked === "function") {
      onEditClicked(identity);
    }
  };

  const hasPassword = !!identity.password;
  const hasPrivateKey = !!identity.privateKeyRef;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-card border-border">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {identity.label || identity.username}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                @{identity.username}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {hasPassword && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Password
              </Badge>
            )}
            {hasPrivateKey && (
              <Badge variant="secondary" className="gap-1">
                <Key className="h-3 w-3" />
                SSH Key
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-muted-foreground">Type:</span>
            <Badge variant="outline" className="text-xs border-border">
              Identity
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted border-t border-border px-6 py-3">
        <div className="flex w-full items-center justify-end">
          <TooltipProvider>
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
                <p>Edit Identity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IdentityCard;
