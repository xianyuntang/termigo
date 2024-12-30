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

import { readFile } from "../../../../core";
import { PublicKey } from "../../../../interfaces";
import Dropzone from "../../../shared/dropzone";
import SidebarCard from "../../../shared/sidebar-card";

interface SidebarProps {
  isOpen: boolean;
  publicKey?: PublicKey;
  onClose?: () => void;
  onSave?: (form: PublicKeyForm) => void;
  onDelete?: (id?: string) => void;
}

export interface PublicKeyForm {
  id?: string;
  label: string;
  content: string;
}

export const Sidebar = ({
  isOpen,
  publicKey,
  onClose,
  onSave,
  onDelete,
}: SidebarProps) => {
  const { handleSubmit, control, setValue, reset, watch } =
    useForm<PublicKeyForm>({
      defaultValues: {
        label: "",
        content: "",
      },
    });

  const id = watch("id");

  const onSubmit: SubmitHandler<PublicKeyForm> = async (data) => {
    if (typeof onSave === "function") {
      onSave(data);
    }
  };

  useEffect(() => {
    setValue("id", publicKey?.id);
    setValue("label", publicKey?.label || "");
    setValue("content", publicKey?.content || "");
  }, [publicKey, setValue, isOpen]);

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
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Label"
                  size="small"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </FormControl>
            )}
          />
        </SidebarCard>

        <SidebarCard title="Key Information">
          <Controller
            name="content"
            control={control}
            rules={{ required: true }}
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
                />
              </FormControl>
            )}
          />
          <Dropzone
            text="Drag and drop to import public key"
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
