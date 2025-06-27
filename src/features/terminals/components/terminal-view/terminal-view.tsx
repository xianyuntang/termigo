import "@xterm/xterm/css/xterm.css";
import "./xterm.css";

import { useDebounceCallback } from "@react-hook/debounce";
import useResizeObserver from "@react-hook/resize-observer";
import { useQuery } from "@tanstack/react-query";
import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal as Xterm } from "@xterm/xterm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { futureService, gptService } from "@/core/services";
import { hostService } from "@/features/hosts";
import { useGlobalShortcut } from "@/hooks/global-shortcut";
import { useTerminalStore } from "@/stores";

import AgentDialog from "../agent-dialog";
import StatusDialog from "../status-overlay/index.ts";
import { ERROR_STATUS, StatusType } from "./constant.ts";
import {
  InEventData,
  isOutEventData,
  isStatusEventData,
  isTrustPublicKeyEventData,
  TerminalEvent,
  TrustPublicKeyEventData,
  WindowChangeEventData,
} from "./interface";

interface TerminalViewProps {
  terminal: string;
}

export const TerminalView = ({ terminal }: TerminalViewProps) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [agentOpen, setAgentOpen] = useState<boolean>(false);
  const [statusOpen, setStatusOpen] = useState<boolean>(true);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  const [xterm, setXterm] = useState<Xterm | undefined>(undefined);
  const fitAddon = useRef<FitAddon>(new FitAddon());
  const webLinkAddon = useRef<WebLinksAddon>(new WebLinksAddon());

  const [status, setStatus] = useState<StatusType>(StatusType._Pending);

  const activeTerminal = useTerminalStore((state) => state.activeTerminal);
  const removeTerminal = useTerminalStore((state) => state.removeTerminal);
  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal
  );

  const resize = useDebounceCallback(() => fitAddon.current.fit(), 100);
  const hostMapper = useTerminalStore((state) => state.hostMapper);

  useResizeObserver(ref, resize);

  const host = useMemo(() => {
    return hostMapper[terminal];
  }, [hostMapper, terminal]);

  const isTerminalActive = useMemo(() => {
    return activeTerminal === terminal;
  }, [activeTerminal, terminal]);

  useGlobalShortcut(
    "CommandOrControl+I",
    () => {
      if (isTerminalActive) {
        setAgentOpen((v) => !v);
      }
    },
    [isTerminalActive]
  );

  const { refetch } = useQuery({
    queryKey: [terminal, host],
    queryFn: async () => {
      if (host) {
        try {
          return hostService.starTerminalStream(host.id, terminal);
        } catch (e) {
          console.log(e);
          throw e;
        }
      }
      return null;
    },
    retry: 0,
    refetchInterval: 0,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (xterm && isTerminalActive && !statusOpen && !agentOpen) {
      xterm.focus();
    }
  }, [agentOpen, isTerminalActive, statusOpen, xterm]);

  const initXterm = useCallback((element: HTMLDivElement) => {
    const xterm = new Xterm({
      cursorBlink: true,
      convertEol: true,
      theme: {
        background: "#1a1a1a",
      },
    });

    xterm.loadAddon(fitAddon.current);
    xterm.loadAddon(webLinkAddon.current);

    xterm.open(element);

    setXterm(xterm);

    return xterm;
  }, []);

  useEffect(() => {
    if (!ref) return;
    const xterm = initXterm(ref);

    return () => {
      xterm.dispose();
      setXterm(undefined);
    };
  }, [ref, initXterm]);

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
          } else if (isTrustPublicKeyEventData(payload)) {
            if (fingerprint) {
              await hostService.updateFingerprint(host.id, fingerprint);
            }
          } else if (isStatusEventData(payload)) {
            setStatus(payload.data.status.type);
            if (payload.data.status.type === StatusType._StartStreaming) {
              await emit(terminal, {
                data: {
                  size: [xterm.cols, xterm.rows],
                } as WindowChangeEventData,
              });
              setStatusOpen(false);
            } else if (
              payload.data.status.type === StatusType._NewPublicKeyFound
            ) {
              setFingerprint(payload.data.status.data as string);
            } else if (ERROR_STATUS.includes(payload.data.status.type)) {
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
  }, [xterm, terminal, fingerprint, host.id]);

  const handleReconnect = async () => {
    if (!ref) return;
    await refetch();
    setStatus(StatusType._Pending);
    initXterm(ref);
  };

  const handleTerminalClose = async () => {
    removeTerminal(terminal);
    setActiveTerminal(null);
  };

  const handleAgentClose = async () => {
    setAgentOpen(false);
  };

  const handleAgentSubmit = async (text: string) => {
    const response = await gptService.getAgentResponse(text);
    await emit(terminal, {
      data: { in: response.text } as InEventData,
    });
    setAgentOpen(false);
  };

  const handleConfirmPublicKey = async (confirm: boolean) => {
    if (confirm) {
      await emit(terminal, {
        data: { trustPublicKey: confirm } as TrustPublicKeyEventData,
      });
    } else {
      await futureService.stopFuture(terminal);
      removeTerminal(terminal);
      setActiveTerminal(null);
    }
  };

  return (
    <div ref={setRef} className="h-full">
      <AgentDialog
        open={agentOpen}
        onSubmit={handleAgentSubmit}
        onClose={handleAgentClose}
      />
      <StatusDialog
        fingerprint={fingerprint}
        open={statusOpen}
        status={status}
        onReconnect={handleReconnect}
        onClose={handleTerminalClose}
        onPublicKeyConfirm={handleConfirmPublicKey}
      />
    </div>
  );
};

export default TerminalView;
