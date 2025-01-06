import { zodResolver } from "@hookform/resolvers/zod";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  FormControl,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { readFile } from "../../../../core";
import { PrivateKey } from "../../../../interfaces";
import Dropzone from "../../../shared/dropzone";
import SidebarCard from "../../../shared/sidebar-card";

interface SidebarProps {
  isOpen: boolean;
  privateKey?: PrivateKey;
  onClose?: () => void;
  onSave?: (form: PrivateKeySchema) => void;
  onDelete?: (id?: string) => void;
}

const privateKeySchema = z.object({
  id: z.string().optional(),
  label: z.string().nonempty(),
  content: z.string(),
});

export type PrivateKeySchema = z.infer<typeof privateKeySchema>;

export const Sidebar = ({
  isOpen,
  privateKey,
  onClose,
  onSave,
  onDelete,
}: SidebarProps) => {
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PrivateKeySchema>({
    defaultValues: {
      label: "",
      content: "",
    },
    resolver: zodResolver(privateKeySchema),
    reValidateMode: "onChange",
  });

  const id = watch("id");

  const onSubmit: SubmitHandler<PrivateKeySchema> = async (data) => {
    if (typeof onSave === "function") {
      onSave(data);
    }
  };

  useEffect(() => {
    setValue("id", privateKey?.id);
    setValue("label", privateKey?.label || "");
    setValue("content", privateKey?.content || "");
  }, [privateKey, setValue, isOpen]);

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      reset();
    }
  };

  const handleFilesDrop = async (files: File[]) => {
    const text = await readFile(files[0]);
    setValue("content", text);
  };

  const handleDelete = async () => {
    if (id && typeof onDelete === "function") {
      onDelete(id);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      anchor="right"
      PaperProps={{
        sx: {
          width: "22rem",
        },
      }}
    >
      <Box
        sx={(theme) => ({
          padding: theme.spacing(2),
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(2),
        })}
      >
        <SidebarCard title="General">
          <Controller
            name="label"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Label"
                  size="small"
                  autoCapitalize="off"
                  autoComplete="off"
                  error={!!errors.label}
                  helperText={errors.label?.message}
                />
              </FormControl>
            )}
          />
        </SidebarCard>

        <SidebarCard title="Key Information">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  multiline
                  minRows={4}
                  label="Content"
                  size="small"
                  autoCapitalize="off"
                  autoComplete="off"
                  error={!!errors.content}
                  helperText={errors.content?.message}
                />
              </FormControl>
            )}
          />
          <Dropzone
            text="Drag and drop to import private key"
            onFilesDrop={handleFilesDrop}
          />
        </SidebarCard>

        <ButtonGroup
          size="small"
          sx={{ float: "right", display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            endIcon={<DeleteIcon />}
            color="error"
            disabled={!id}
            onClick={handleDelete}
          >
            delete
          </Button>
          <Button endIcon={<CheckIcon />} onClick={handleSubmit(onSubmit)}>
            save
          </Button>
        </ButtonGroup>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
