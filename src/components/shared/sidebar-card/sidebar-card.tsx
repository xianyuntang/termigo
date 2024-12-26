import { Card, CardContent, CardHeader } from "@mui/material";

interface SidebarCardProps {
  title: string;
  children: React.ReactNode;
}

const SidebarCard = ({ title, children }: SidebarCardProps) => {
  return (
    <Card sx={{ width: "20rem" }}>
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
    </Card>
  );
};

export default SidebarCard;
