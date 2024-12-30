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

import { AuthType, Host } from "../../../../interfaces";
import {
  hostService,
  identityService,
  publicKeyService,
} from "../../../../services";
import SidebarCard from "../../../shared/sidebar-card";

interface SidebarProps {
  isOpen: boolean;
  host?: Host;
  onClose?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

interface ModifyHostForm {
  id?: string;
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

  const id = watch("id");

  const onSubmit: SubmitHandler<ModifyHostForm> = async (data) => {
    if (data.id) {
      await hostService.update(
        data.id,
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
      await hostService.add(
        data.address,
        data.port,
        data.authType,
        data.label,
        data.identity,
        data.username,
        data.password,
        data.publicKey
      );
    }
    if (typeof onSave === "function") {
      onSave();
    }
  };

  const { data: identities } = useQuery({
    queryKey: ["identities"],
    queryFn: identityService.listIdentities,
  });

  const { data: publicKeys } = useQuery({
    queryKey: ["publicKeys"],
    queryFn: publicKeyService.list,
  });

  const authType = watch("authType");

  useEffect(() => {
    setValue("id", host?.id);
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

  const handleDelete = async () => {
    if (id) {
      await hostService.remove(id);
    }

    if (typeof onDelete === "function") {
      onDelete();
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

            {authType === AuthType.Identity && (
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
            {authType === AuthType.Username && (
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
                  rules={{ required: true }}
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
              disabled={!watch()}
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
