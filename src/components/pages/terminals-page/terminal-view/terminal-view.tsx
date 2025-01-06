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
  Typography,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Terminal as Xterm } from "@xterm/xterm";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { Host } from "../../../../interfaces";
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
  const [host, setHost] = useState<Host | undefined>(undefined);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | undefined>(
    undefined,
  );
  const [xterm, setXterm] = useState<Xterm | undefined>(undefined);
  const [fitAddon, setFitAddon] = useState<FitAddon | undefined>(undefined);
  const [status, setStatus] = useState<StatusType>(StatusType.Pending);

  const activeTerminal = useTerminalStore((state) => state.activeTerminal);
  const removeTerminal = useTerminalStore((state) => state.removeTerminal);

  const theme = useTheme();

  const resize = useDebounceCallback(() => fitAddon?.fit(), 100);

  const hostMapper = useTerminalStore((state) => state.hostMapper);

  useEffect(() => {
    if (terminal in hostMapper) {
      setHost(hostMapper[terminal]);
    } else {
      setHost(undefined);
    }
  }, [terminal, hostMapper]);

  const { refetch } = useQuery({
    queryKey: [terminal, host],
    queryFn: async () => {
      if (host) {
        return hostService.starTerminalStream(host.id, terminal);
      }
      return null;
    },
    refetchInterval: 0,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const ERROR_STATUS = useMemo(
    () => [StatusType.ConnectionTimeout, StatusType.AuthFailed],
    [],
  );

  useEffect(() => {
    if (activeTerminal === terminal) {
      xterm?.focus();
    }
  }, [activeTerminal, terminal, xterm]);

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
    [theme.palette.background.paper],
  );

  useEffect(() => {
    if (!containerRef) return;
    const xterm = initXterm(containerRef);
    return () => {
      xterm.dispose();
      setXterm(undefined);
    };
  }, [containerRef, initXterm]);

  useEffect(() => {
    if (!fitAddon || !containerRef) return;

    const observer = new ResizeObserver(() => {
      resize();
    });

    observer.observe(containerRef);

    return () => {
      observer.disconnect();
    };
  }, [fitAddon, containerRef, resize]);

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
  }, [xterm, terminal]);

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
            } else if (ERROR_STATUS.includes(payload.data.status)) {
              await futureService.stopFuture(terminal);
            }
          }
        },
      );
    })();

    return () => {
      if (unlistenOutFn) {
        unlistenOutFn();
      }
    };
  }, [xterm, ERROR_STATUS, terminal]);

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
            Trying to connect to {host?.label || host?.address}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              <LinearProgress
                color={ERROR_STATUS.includes(status) ? "error" : "primary"}
                variant="determinate"
                value={progress}
              />
              <Typography component="span" variant="body2">
                {status}
              </Typography>
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
