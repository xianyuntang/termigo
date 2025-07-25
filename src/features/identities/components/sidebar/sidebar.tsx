import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { privateKeyService } from "@/features/private-keys";
import { cn } from "@/lib/utils";
import Card from "@/shared/components/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Identity } from "@/types/interfaces";

interface SidebarProps {
  isOpen: boolean;
  identity?: Identity;
  onClose?: () => void;
  onSave?: (_form: IdentitySchema) => void;
  onDelete?: (_id?: string) => void;
}

const identitySchema = z.object({
  id: z.string().optional(),
  label: z.string().nonempty(),
  username: z.string().nonempty(),
  password: z.string(),
  privateKeyRef: z.string(),
});

export type IdentitySchema = z.infer<typeof identitySchema>;

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

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<IdentitySchema>({
    defaultValues: {
      label: "",
      username: "",
      password: "",
      privateKeyRef: "",
    },
    resolver: zodResolver(identitySchema),
    reValidateMode: "onChange",
  });

  const id = watch("id");

  const onSubmit: SubmitHandler<IdentitySchema> = async (data) => {
    if (typeof onSave === "function") {
      onSave(data);
    }
  };

  useEffect(() => {
    setValue("id", identity?.id);
    setValue("label", identity?.label || "");
    setValue("username", identity?.username || "");
    setValue("password", identity?.password || "");
    setValue("privateKeyRef", identity?.privateKeyRef || "");
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
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[352px] sm:w-[352px] bg-background border-l border-border p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>{identity ? "Edit Identity" : "New Identity"}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
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

          <Card title="Key Information">
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="privateKeyRef">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {privateKeys?.map((privateKey) => (
                        <SelectItem key={privateKey.id} value={privateKey.id}>
                          {privateKey.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
