import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  ButtonGroup,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { Identity } from "../../../../interfaces";
import { publicKeyService } from "../../../../services";
import SidebarCard from "../../../shared/sidebar-card";

interface SidebarProps {
  isOpen: boolean;
  identity?: Identity;
  onClose?: () => void;
  onSave?: (form: IdentityForm) => void;
  onDelete?: (id?: string) => void;
}

export interface IdentityForm {
  id?: string;
  label: string;
  username: string;
  password: string;
  publicKey: string;
}

export const Sidebar = ({
  isOpen,
  identity,
  onClose,
  onSave,
  onDelete,
}: SidebarProps) => {
  const { data: publicKeys } = useQuery({
    queryKey: ["publicKeys"],
    queryFn: publicKeyService.list,
  });

  const { handleSubmit, control, setValue, reset, watch } =
    useForm<IdentityForm>({
      defaultValues: {
        label: "",
        username: "",
        password: "",
        publicKey: "",
      },
    });

  const id = watch("id");

  const onSubmit: SubmitHandler<IdentityForm> = async (data) => {
    if (typeof onSave === "function") {
      onSave(data);
    }
  };

  useEffect(() => {
    setValue("id", identity?.id);
    setValue("label", identity?.label || "");
    setValue("username", identity?.username || "");
    setValue("password", identity?.password || "");
    setValue("publicKey", identity?.publicKey || "");
  }, [identity, setValue, isOpen]);

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      reset();
    }
  };

  const handleDelete = async () => {
    if (typeof onDelete === "function") {
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
                />
              </FormControl>
            )}
          />
        </SidebarCard>

        <SidebarCard title="Key Information">
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Username"
                  size="small"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </FormControl>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Password"
                  size="small"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </FormControl>
            )}
          />

          <Controller
            name="publicKey"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel id="public-key-select">Public Key</InputLabel>
                <Select
                  labelId="public-key-select"
                  label="Public Key"
                  {...field}
                >
                  {publicKeys?.map((publicKey) => (
                    <MenuItem key={publicKey.id} value={publicKey.id}>
                      {publicKey.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
