import { zodResolver } from "@hookform/resolvers/zod";
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
import { z } from "zod";

import { AuthType, Host } from "../../../../interfaces";
import { identityService, privateKeyService } from "../../../../services";
import Card from "../../../shared/card";

interface SidebarProps {
  isOpen: boolean;
  host?: Host;
  onClose?: () => void;
  onSave?: (form: HostSchema) => void;
  onDelete?: (id?: string) => void;
}

const hostSchema = z.object({
  id: z.string().optional(),
  label: z.string().nonempty(),
  address: z.string().nonempty(),
  port: z
    .string()
    .nonempty()
    .refine((value) => !isNaN(Number(value)), {
      message: "Must be a valid number",
    }),
  authType: z.nativeEnum(AuthType),
  identity: z.string(),
  username: z.string(),
  password: z.string(),
  privateKey: z.string(),
});

export type HostSchema = z.infer<typeof hostSchema>;

export const Sidebar = ({
  isOpen,
  host,
  onClose,
  onSave,
  onDelete,
}: SidebarProps) => {
  const {
    formState: { errors },
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
  } = useForm<HostSchema>({
    defaultValues: {
      label: "",
      address: "",
      port: "22",
      authType: AuthType.Username,
      identity: "",
      username: "",
      password: "",
      privateKey: "",
    },
    resolver: zodResolver(hostSchema),
    reValidateMode: "onChange",
  });

  const id = watch("id");

  const onSubmit: SubmitHandler<HostSchema> = async (data) => {
    if (typeof onSave === "function") {
      onSave(data);
    }
  };

  const { data: identities } = useQuery({
    queryKey: ["identities"],
    queryFn: identityService.list,
  });

  const { data: privateKeys } = useQuery({
    queryKey: ["privateKeys"],
    queryFn: privateKeyService.list,
  });

  const authType = watch("authType");

  useEffect(() => {
    setValue("id", host?.id);
    setValue("label", host?.label || "");
    setValue("address", host?.address || "");
    setValue("port", host?.port.toString() || "22");
    setValue("authType", host?.authType || AuthType.Username);
    if (host?.authType === AuthType.Identity) {
      setValue("identity", host?.identity || "");
    } else {
      setValue("username", host?.username || "");
      setValue("password", host?.password || "");
      setValue("privateKey", host?.privateKey || "");
    }
  }, [host, setValue, isOpen]);

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
        <Card title="General">
          <Controller
            name="label"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Label"
                  size="small"
                  slotProps={{
                    input: {
                      autoCapitalize: "none",
                      spellCheck: false,
                      autoComplete: "off",
                    },
                  }}
                  autoCorrect="off"
                  error={!!errors.label}
                  helperText={errors.label?.message}
                />
              </FormControl>
            )}
          />
        </Card>

        <Card title="Connection Information">
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Address"
                  size="small"
                  slotProps={{
                    input: {
                      autoCapitalize: "none",
                      spellCheck: false,
                      autoComplete: "off",
                    },
                  }}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              </FormControl>
            )}
          />
          <Controller
            name="port"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <TextField
                  {...field}
                  label="Port"
                  size="small"
                  slotProps={{
                    input: {
                      autoCapitalize: "none",
                      spellCheck: false,
                      autoComplete: "off",
                    },
                  }}
                />
              </FormControl>
            )}
          />
        </Card>

        <Card title="Credential">
          <Controller
            name="authType"
            control={control}
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
                  <Select {...field} labelId="identity-select" label="Identity">
                    {identities?.map((identity) => (
                      <MenuItem key={identity.id} value={identity.id}>
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
                    <TextField
                      {...field}
                      label="Username"
                      size="small"
                      autoCapitalize="off"
                      autoComplete="off"
                      error={!!errors.username}
                      helperText={errors.username?.message}
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
                      type="password"
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
            </>
          )}
        </Card>

        <ButtonGroup
          size="small"
          sx={{ float: "right", display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            endIcon={<DeleteIcon />}
            color="error"
            disabled={!watch("id")}
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
