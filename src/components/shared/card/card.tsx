import { Card as MuiCard, CardContent, CardHeader } from "@mui/material";
import { ReactNode } from "react";

interface SidebarCardProps {
  title: string;
  children: ReactNode;
}

const Card = ({ title, children }: SidebarCardProps) => {
  return (
    <MuiCard sx={{ width: "20rem" }}>
      <CardHeader title={title} />
      <CardContent
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(2),
        })}
      >
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;
