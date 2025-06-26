import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Play, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

import { Portforward } from "../../../../stores";
import Card from "../../../shared/card";

interface TunnelDialogProps {
  portforwards?: Portforward[];
  isOpen: boolean;
  onTunnelStart?: (form: TunnelSchema) => void;
  onTunnelStop?: (tunnel: string) => void;
  onClose?: () => void;
}

const tunnelSchema = z.object({
  localAddress: z.string(),
  localPort: z
    .string()
    .nonempty()
    .refine((value) => !isNaN(Number(value)), {
      message: "Must be a valid number",
    }),
  destinationAddress: z.string(),
  destinationPort: z
    .string()
    .nonempty()
    .refine((value) => !isNaN(Number(value)), {
      message: "Must be a valid number",
    }),
});

export type TunnelSchema = z.infer<typeof tunnelSchema>;

const TunnelDialog = ({
  portforwards,
  isOpen,
  onTunnelStart,
  onTunnelStop,
  onClose,
}: TunnelDialogProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TunnelSchema>({
    defaultValues: {
      localAddress: "127.0.0.1",
      localPort: "",
      destinationAddress: "127.0.0.1",
      destinationPort: "",
    },
    resolver: zodResolver(tunnelSchema),
    reValidateMode: "onChange",
  });

  const destinationPort = watch("destinationPort");

  useEffect(() => {
    setValue("localPort", destinationPort);
  }, [setValue, destinationPort]);

  const onSubmit: SubmitHandler<TunnelSchema> = async (data) => {
    if (typeof onTunnelStart === "function") {
      onTunnelStart(data);
    }
  };

  const handleCloseClick = () => {
    if (typeof onClose === "function") {
      onClose();
    }
    reset();
  };

  const handleStopPortforward = (tunnel: string) => {
    if (typeof onTunnelStop === "function") {
      onTunnelStop(tunnel);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleCloseClick}>
      <SheetContent className="w-[352px] sm:w-[352px]">
        <SheetHeader>
          <SheetTitle>Port Forwarding</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Card title="Port Forward">
            <Controller
              name="destinationAddress"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="destinationAddress">
                    Destination Address
                  </Label>
                  <Input
                    id="destinationAddress"
                    {...field}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                    className={cn(
                      errors.destinationAddress && "border-destructive"
                    )}
                  />
                  {errors.destinationAddress && (
                    <p className="text-sm text-destructive">
                      {errors.destinationAddress.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="destinationPort"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="destinationPort">Destination Port</Label>
                  <Input
                    id="destinationPort"
                    {...field}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                    className={cn(
                      errors.destinationPort && "border-destructive"
                    )}
                  />
                  {errors.destinationPort && (
                    <p className="text-sm text-destructive">
                      {errors.destinationPort.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="localAddress"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="localAddress">Local Address</Label>
                  <Input
                    id="localAddress"
                    {...field}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                    className={cn(errors.localAddress && "border-destructive")}
                  />
                  {errors.localAddress && (
                    <p className="text-sm text-destructive">
                      {errors.localAddress.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="localPort"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="localPort">Local Port</Label>
                  <Input
                    id="localPort"
                    {...field}
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                    className={cn(errors.localPort && "border-destructive")}
                  />
                  {errors.localPort && (
                    <p className="text-sm text-destructive">
                      {errors.localPort.message}
                    </p>
                  )}
                </div>
              )}
            />
          </Card>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit(onSubmit)}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          </div>

          <Card title="Current forwarding">
            <div className="space-y-1">
              {portforwards?.map((pf) => (
                <div
                  key={pf.tunnel}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono">
                      {pf.localAddress}:{pf.localPort}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">
                      {pf.destinationAddress}:{pf.destinationPort}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleStopPortforward(pf.tunnel)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!portforwards || portforwards.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active port forwards
                </p>
              )}
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TunnelDialog;
