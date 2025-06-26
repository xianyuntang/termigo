import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { settingService } from "../../../services";
import Card from "../../shared/card";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import UpdateCard from "./update-card";

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
    <div className="w-full h-full flex flex-col justify-between">
      <div className="w-full flex flex-col gap-2">
        <UpdateCard />
        <Card title="GPT" fullWidth>
          <div className="space-y-2">
            <Label htmlFor="gptApiKey">Open AI Api Key</Label>
            <Controller
              name="gptApiKey"
              control={control}
              render={({ field }) => (
                <Input
                  id="gptApiKey"
                  type="password"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="off"
                  className={cn(errors.gptApiKey && "border-destructive")}
                  {...field}
                />
              )}
            />
            {errors.gptApiKey && (
              <p className="text-sm text-destructive">
                {errors.gptApiKey.message}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="flex w-full gap-2">
        <Button onClick={handleSubmit(onSubmit)} size="sm" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button
          variant="destructive"
          onClick={handleClearDataClick}
          size="sm"
          className="flex-1"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Clear Data
        </Button>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        onConfirm={handleConfirmClearData}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default SettingsPage;
