import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Card as ShadcnCard,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface CardProps {
  title: string;
  fullWidth?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
}

const Card = ({ title, fullWidth, children, actions }: CardProps) => {
  return (
    <ShadcnCard
      className={cn(
        fullWidth ? "w-full" : "w-80",
        "bg-card border-border text-card-foreground",
      )}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {children && (
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      )}
      {actions && <CardFooter className="p-4">{actions}</CardFooter>}
    </ShadcnCard>
  );
};

export default Card;
