import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, ButtonGroup, Grid2, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { settingService } from "../../../services";
import Card from "../../shared/card";

const settingsSchema = z.object({
  gptApiKey: z.string(),
});

type SettingsSchema = z.infer<typeof settingsSchema>;

const SettingsPage = () => {
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
        <Button onClick={handleSubmit(onSubmit)}>save</Button>
        <Button color="error" onClick={handleSubmit(onSubmit)}>
          factory reset
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default SettingsPage;
