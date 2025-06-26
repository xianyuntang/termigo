import { Edit, Key, Lock } from "lucide-react";

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
import { PrivateKey } from "@/types/interfaces";

interface CardProps {
  privateKey: PrivateKey;
  onEditClicked?: (_privateKey: PrivateKey) => void;
}

const PrivateKeyCard = ({ privateKey, onEditClicked }: CardProps) => {
  const handleEditClick = () => {
    if (typeof onEditClicked === "function") {
      onEditClicked(privateKey);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-card border-border">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {privateKey.label}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                SSH Private Key
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2 gap-1">
            <Lock className="h-3 w-3" />
            Encrypted
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-muted-foreground">Format:</span>
            <Badge variant="outline" className="text-xs border-border">
              RSA/ED25519
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-muted-foreground">Status:</span>
            <Badge variant="outline" className="text-xs border-border">
              Active
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
                <p>Edit Private Key</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PrivateKeyCard;
