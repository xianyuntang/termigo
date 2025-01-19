import {
  Card as MuiCard,
  CardActions,
  CardContent,
  CardHeader,
} from "@mui/material";
import { ReactNode } from "react";

interface SidebarCardProps {
  title: string;
  fullWidth?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
}

const Card = ({ title, fullWidth, children, actions }: SidebarCardProps) => {
  return (
    <MuiCard sx={{ width: fullWidth ? "100%" : "20em" }}>
      <CardHeader title={title} />
      {children && (
        <CardContent
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
          })}
        >
          {children}
        </CardContent>
      )}

      {actions && (
        <CardActions sx={(theme) => ({ padding: theme.spacing(2) })}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

export default Card;
