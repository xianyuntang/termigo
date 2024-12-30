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
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { readFile } from "../../../../core";
import { AuthType, Host } from "../../../../interfaces";
import { hostService, identityService } from "../../../../services";
import Dropzone from "../../../shared/dropzone";
import SidebarCard from "../../../shared/sidebar-card";

interface SidebarProps {
  isOpen: boolean;
  host?: Host;
  onClose?: () => void;
  onSave?: () => void;
  onDelete?: (host: string) => void;
}

interface ModifyHostForm {
  label: string;
  address: string;
  port: number;
  authType: AuthType;
  identity: string;
  username: string;
  password: string;
  publicKey: string;
}

export const Sidebar = ({
  isOpen,
  host,
  onClose,
  onSave,
  onDelete,
}: SidebarProps) => {
  const [hostId, setHostId] = useState<string | undefined>(host?.id);

  const { handleSubmit, control, setValue, reset, watch } =
    useForm<ModifyHostForm>({
      defaultValues: {
        label: "",
        address: "",
        port: 22,
        authType: AuthType.Username,
        identity: "",
        username: "",
        password: "",
        publicKey: "",
      },
    });

  const onSubmit: SubmitHandler<ModifyHostForm> = async (data) => {
    if (hostId) {
      await hostService.updateHost(
        hostId,
        data.address,
        data.port,
        data.authType,
        data.label,
        data.identity,
        data.username,
        data.password,
        data.publicKey
      );
    } else {
      const response = await hostService.addHost(
        data.address,
        data.port,
        data.authType,
        data.label,
        data.identity,
        data.username,
        data.password,
        data.publicKey
      );
      setHostId(response.id);
    }
    if (typeof onSave === "function") {
      onSave();
    }
  };

  const { data: identities } = useQuery({
    queryKey: ["identities"],
    queryFn: identityService.listIdentities,
  });

  useEffect(() => {
    setHostId(host?.id);
    setValue("label", host?.label || "");
    setValue("address", host?.address || "");
    setValue("port", host?.port || 22);
    setValue("authType", host?.authType || AuthType.Username);
    if (host?.authType === AuthType.Identity) {
      setValue("identity", host?.identity || "");
    } else {
      setValue("username", host?.username || "");
      setValue("password", host?.password || "");
      setValue("publicKey", host?.publicKey || "");
    }
  }, [host, setValue, isOpen]);

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      reset();
    }
  };

  const handleFilesDrop = async (files: File[]) => {
    const text = await readFile(files[0]);
    setValue("publicKey", text);
  };

  const handleDelete = async () => {
    if (hostId && typeof onDelete === "function") {
      onDelete(hostId);
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
      <form>
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
                  <TextField {...field} label="Label" size="small" />
                </FormControl>
              )}
            />
          </SidebarCard>

          <SidebarCard title="Connection Information">
            <Controller
              name="address"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <TextField {...field} label="Address" size="small" />
                </FormControl>
              )}
            />
            <Controller
              name="port"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <TextField
                    {...field}
                    label="Port"
                    size="small"
                    type="number"
                  />
                </FormControl>
              )}
            />
          </SidebarCard>

          <SidebarCard title="Credential">
            <Controller
              name="authType"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel id="auth-type-select">Credential from</InputLabel>
                  <Select
                    labelId="auth-type-select"
                    label="Credential from"
                    {...field}
                  >
                    <MenuItem value={AuthType.Username}>
                      Username and password
                    </MenuItem>
                    <MenuItem value={AuthType.Identity}>Identity</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {watch("authType") === AuthType.Identity && (
              <Controller
                name="identity"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="identity-select">Identity</InputLabel>
                    <Select
                      {...field}
                      labelId="identity-select"
                      label="Identity"
                    >
                      {identities?.map((identity) => (
                        <MenuItem key={identity.id} value={identity.label}>
                          {identity.label || identity.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            )}
            {watch("authType") === AuthType.Username && (
              <>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <TextField {...field} label="Username" size="small" />
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
                        type="password"
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  name="publicKey"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <TextField
                        {...field}
                        label="Public Key"
                        multiline
                        minRows={5}
                      />
                    </FormControl>
                  )}
                />
                <Dropzone
                  text="Drag and drop to import public key"
                  onFilesDrop={handleFilesDrop}
                />
              </>
            )}
          </SidebarCard>

          <ButtonGroup
            size="small"
            sx={{ float: "right", display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              endIcon={<DeleteIcon />}
              color="error"
              disabled={!hostId}
              onClick={handleDelete}
            >
              delete
            </Button>
            <Button endIcon={<CheckIcon />} onClick={handleSubmit(onSubmit)}>
              save
            </Button>
          </ButtonGroup>
        </Box>
      </form>
    </Drawer>
  );
};

export default Sidebar;
