import "@xterm/xterm/css/xterm.css";
import "./xterm.css";

import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal as Xterm } from "@xterm/xterm";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { futureService, hostService } from "../../../../services";
import { useTerminalStore } from "../../../../stores";
import {
  InEventData,
  isOutEventData,
  isStatusEventData,
  StatusType,
  TerminalEvent,
  WindowChangeEventData,
} from "./interface";

interface TerminalViewProps {
  terminal: string;
}

export const TerminalView = ({ terminal }: TerminalViewProps) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | undefined>(
    undefined
  );
  const [xterm, setXterm] = useState<Xterm | undefined>(undefined);
  const [fitAddon, setFitAddon] = useState<FitAddon | undefined>(undefined);
  const [status, setStatus] = useState<StatusType>(StatusType.Pending);

  const removeTerminal = useTerminalStore((state) => state.removeTerminal);

  const theme = useTheme();

  const resize = useDebounceCallback(() => fitAddon?.fit(), 100);

  const getHost = useTerminalStore((state) => state.getHost);
  const host = getHost(terminal);

  const { refetch } = useQuery({
    queryKey: [terminal, host],
    queryFn: () => hostService.starTerminalStream(host.id, terminal),
  });

  const ERROR_STATUS = [StatusType.ConnectionTimeout, StatusType.AuthFailed];

  const initXterm = useCallback(
    (element: HTMLDivElement) => {
      const xterm = new Xterm({
        cursorBlink: true,
        convertEol: true,
        theme: {
          background: theme.palette.background.paper,
        },
      });
      const fitAddon = new FitAddon();
      const webglAddon = new WebglAddon();

      xterm.loadAddon(fitAddon);
      xterm.loadAddon(webglAddon);

      xterm.open(element);

      setFitAddon(fitAddon);
      setXterm(xterm);
      return xterm;
    },
    [theme.palette.background.paper, setFitAddon, setXterm]
  );

  useEffect(() => {
    if (!containerRef) return;
    const xterm = initXterm(containerRef);
    return () => {
      xterm.dispose();
      setXterm(undefined);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!fitAddon || !containerRef) return;

    const observer = new ResizeObserver(() => {
      resize();
    });

    observer.observe(containerRef);

    return () => {
      observer.disconnect();
    };
  }, [fitAddon, containerRef]);

  useEffect(() => {
    if (!xterm) return;

    xterm.onData(async (data) => {
      await emit(terminal, {
        data: { in: data } as InEventData,
      });
    });
    xterm.onResize(async (evt) => {
      await emit(terminal, {
        data: { size: [evt.cols, evt.rows] } as WindowChangeEventData,
      });
    });

    return () => {
      xterm.dispose();
    };
  }, [xterm]);

  useEffect(() => {
    if (!xterm) return;
    let unlistenOutFn: UnlistenFn | undefined;

    (async () => {
      unlistenOutFn = await listen<TerminalEvent>(
        terminal,
        async ({ payload }) => {
          if (isOutEventData(payload)) {
            xterm.write(payload.data.out);
          } else if (isStatusEventData(payload)) {
            setStatus(payload.data.status);
            if (payload.data.status === StatusType.StartStreaming) {
              await emit(terminal, {
                data: {
                  size: [xterm.cols, xterm.rows],
                } as WindowChangeEventData,
              });
              xterm.focus();
            } else if (ERROR_STATUS.includes(payload.data.status)) {
              await futureService.stopFuture(terminal);
            }
          }
        }
      );
    })();

    return () => {
      if (unlistenOutFn) {
        unlistenOutFn();
      }
    };
  }, [xterm]);

  const progress = useMemo(() => {
    switch (status) {
      case StatusType.Pending:
        return 0;
      case StatusType.Connecting:
        return 25;
      case StatusType.Connected:
        return 50;
      case StatusType.ChannelOpened:
        return 75;
      case StatusType.StartStreaming:
        return 100;
      default:
        return 0;
    }
  }, [status]);

  const handleReconnectClick = async () => {
    if (!containerRef) return;
    refetch();
    setStatus(StatusType.Pending);
    initXterm(containerRef);
  };

  const handleCloseClick = async () => {
    removeTerminal(terminal);
  };

  return (
    <Box ref={setContainerRef} sx={{ height: "100%" }}>
      <Dialog open={status !== StatusType.StartStreaming}>
        <Box sx={{ width: "fit" }}>
          <DialogTitle>
            Trying to connect to {host.label || host.address}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              <LinearProgress
                color={ERROR_STATUS.includes(status) ? "error" : "primary"}
                variant="determinate"
                value={progress}
              />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={!ERROR_STATUS.includes(status)}
              endIcon={<ReplayIcon />}
              onClick={handleReconnectClick}
            >
              retry
            </Button>
            <Button
              disabled={!ERROR_STATUS.includes(status)}
              color="error"
              endIcon={<CloseIcon />}
              onClick={handleCloseClick}
            >
              close
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default TerminalView;
