import { zodResolver } from "@hookform/resolvers/zod";
import DangerousIcon from "@mui/icons-material/Dangerous";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { Box, Button, ButtonGroup, Grid2, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { settingService } from "../../../services";
import Card from "../../shared/card";
import { ConfirmDialog } from "../../shared/confirm-dialog";

const settingsSchema = z.object({
  gptApiKey: z.string(),
});

type SettingsSchema = z.infer<typeof settingsSchema>;

const SettingsPage = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const {
    formState: { errors },
    control,
    handleSubmit,
    setValue,
  } = useForm<SettingsSchema>({
    defaultValues: {
      gptApiKey: "",
    },
    resolver: zodResolver(settingsSchema),
  });

  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: settingService.getSettings,
  });

  useEffect(() => {
    setValue("gptApiKey", data?.gptApiKey || "");
  }, [data, setValue]);

  const onSubmit: SubmitHandler<SettingsSchema> = async (data) => {
    await settingService.updateSettings(data.gptApiKey);
  };

  const handleClearDataClick = async () => {
    setDialogOpen(true);
  };

  const handleConfirmClearData = async () => {
    await settingService.clearData();
    setDialogOpen(false);
  };

  const handleCloseDialog = async () => {
    setDialogOpen(false);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Grid2 container>
        <Grid2>
          <Card title="GPT">
            <Controller
              name="gptApiKey"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Open AI Api Key"
                  size="small"
                  {...field}
                  slotProps={{
                    input: {
                      autoCapitalize: "none",
                      spellCheck: false,
                      autoComplete: "off",
                    },
                  }}
                  error={!!errors.gptApiKey}
                  helperText={errors.gptApiKey?.message}
                  type="password"
                />
              )}
            />
          </Card>
        </Grid2>
      </Grid2>
      <ButtonGroup fullWidth>
        <Button onClick={handleSubmit(onSubmit)} endIcon={<SaveAltIcon />}>
          save
        </Button>
        <Button
          color="error"
          onClick={handleClearDataClick}
          endIcon={<DangerousIcon />}
        >
          clear data
        </Button>
      </ButtonGroup>

      <ConfirmDialog
        open={dialogOpen}
        onConfirm={handleConfirmClearData}
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default SettingsPage;
