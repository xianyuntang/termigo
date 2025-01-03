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
import { privateKeyService } from "../../../../services";
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
  privateKey: string;
}

export const Sidebar = ({
  isOpen,
  identity,
  onClose,
  onSave,
  onDelete,
}: SidebarProps) => {
  const { data: privateKeys } = useQuery({
    queryKey: ["privateKeys"],
    queryFn: privateKeyService.list,
  });

  const { handleSubmit, control, setValue, reset, watch } =
    useForm<IdentityForm>({
      defaultValues: {
        label: "",
        username: "",
        password: "",
        privateKey: "",
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
    setValue("privateKey", identity?.privateKey || "");
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
            name="privateKey"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth size="small">
                <InputLabel id="private-key-select">Private Key</InputLabel>
                <Select
                  labelId="private-key-select"
                  label="Private Key"
                  {...field}
                >
                  {privateKeys?.map((privateKey) => (
                    <MenuItem key={privateKey.id} value={privateKey.id}>
                      {privateKey.label}
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
