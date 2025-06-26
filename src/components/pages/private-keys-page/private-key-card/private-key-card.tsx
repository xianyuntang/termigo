import { Edit } from "lucide-react";

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

import { PrivateKey } from "../../../../interfaces";

interface CardProps {
  privateKey: PrivateKey;
  onEditClicked?: (privateKey: PrivateKey) => void;
}

const PrivateKeyCard = ({ privateKey, onEditClicked }: CardProps) => {
  const handleEditClick = () => {
    if (typeof onEditClicked === "function") {
      onEditClicked(privateKey);
    }
  };

  return (
    <Card className="w-60">
      <CardHeader>
        <CardTitle>{privateKey.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Private Key</p>
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
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default PrivateKeyCard;
