import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { AuthType, Host } from "../../../../interfaces";
import { identityService, privateKeyService } from "../../../../services";
import Card from "../../../shared/card";

interface SidebarProps {
  isOpen: boolean;
  host?: Host;
  onClose?: () => void;
  onSave?: (_form: HostSchema) => void;
  onDelete?: (_id?: string) => void;
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
  identityRef: z.string(),
  username: z.string(),
  password: z.string(),
  privateKeyRef: z.string(),
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
      authType: AuthType._Local,
      identityRef: "",
      username: "",
      password: "",
      privateKeyRef: "",
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
    if (host?.credential.type === AuthType._Local) {
      setValue("username", host.credential.data.username);
      setValue("password", host.credential.data.password || "");
      setValue("privateKeyRef", host.credential.data.privateKeyRef || "");
    } else if (host?.credential.type === AuthType._Identity) {
      setValue("identityRef", host.credential.data);
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
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[352px] sm:w-[352px] bg-background border-l border-border">
        <SheetHeader>
          <SheetTitle>{host ? "Edit Host" : "New Host"}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Card title="General">
            <Controller
              name="label"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    {...field}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                    className={cn(errors.label && "border-destructive")}
                  />
                  {errors.label && (
                    <p className="text-sm text-destructive">
                      {errors.label.message}
                    </p>
                  )}
                </div>
              )}
            />
          </Card>

          <Card title="Connection Information">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...field}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                    className={cn(errors.address && "border-destructive")}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="port"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    {...field}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                    className={cn(errors.port && "border-destructive")}
                  />
                  {errors.port && (
                    <p className="text-sm text-destructive">
                      {errors.port.message}
                    </p>
                  )}
                </div>
              )}
            />
          </Card>

          <Card title="Credential">
            <Controller
              name="authType"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="authType">Credential from</Label>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger id="authType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AuthType._Local.toString()}>
                        Local
                      </SelectItem>
                      <SelectItem value={AuthType._Identity.toString()}>
                        Identity
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {authType === AuthType._Identity && (
              <Controller
                name="identityRef"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="identityRef">Identity Ref</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="identityRef">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {identities?.map((identity) => (
                          <SelectItem key={identity.id} value={identity.id}>
                            {identity.label || identity.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            )}
            {authType === AuthType._Local && (
              <>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        {...field}
                        autoCapitalize="none"
                        spellCheck={false}
                        autoComplete="off"
                        className={cn(errors.username && "border-destructive")}
                      />
                      {errors.username && (
                        <p className="text-sm text-destructive">
                          {errors.username.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...field}
                        autoCapitalize="none"
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="privateKeyRef"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="privateKeyRef">Private Key Ref</Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="privateKeyRef">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {privateKeys?.map((privateKey) => (
                            <SelectItem
                              key={privateKey.id}
                              value={privateKey.id}
                            >
                              {privateKey.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </>
            )}
          </Card>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              disabled={!watch("id")}
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleSubmit(onSubmit)}
            >
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
