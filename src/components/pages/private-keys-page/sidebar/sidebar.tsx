import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { readFile } from "../../../../core";
import { PrivateKey } from "../../../../interfaces";
import Card from "../../../shared/card";
import Dropzone from "../../../shared/dropzone";

interface SidebarProps {
  isOpen: boolean;
  privateKey?: PrivateKey;
  onClose?: () => void;
  onSave?: (_form: PrivateKeySchema) => void;
  onDelete?: (_id?: string) => void;
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
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[352px] sm:w-[352px] bg-background border-l border-border">
        <SheetHeader>
          <SheetTitle>
            {privateKey ? "Edit Private Key" : "New Private Key"}
          </SheetTitle>
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

          <Card title="Key Information">
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    {...field}
                    className={cn(
                      "min-h-[100px] font-mono text-xs",
                      errors.content && "border-destructive",
                    )}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">
                      {errors.content.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Dropzone
              text="Drag and drop to import private key"
              onFilesDrop={handleFilesDrop}
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
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
