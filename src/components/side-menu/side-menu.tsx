import { useNavigate } from "@tanstack/react-router";
import { Key, Monitor, Settings, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useTerminalStore } from "../../stores";

const SideMenu = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const setActiveTerminal = useTerminalStore(
    (state) => state.setActiveTerminal
  );

  const navigate = useNavigate();

  const items = [
    { icon: Monitor, text: "Hosts", url: "/hosts" },
    { icon: User, text: "Identities", url: "/identities" },
    { icon: Key, text: "Private Keys", url: "/private-keys" },
    { icon: Settings, text: "Settings", url: "/settings" },
  ];

  const handleClick = async (index: number, url: string) => {
    setActiveIndex(index);
    setActiveTerminal(null);
    await navigate({ to: url });
  };

  return (
    <aside className="w-48 border-r bg-background">
      <nav className="flex flex-col flex-1 p-2 gap-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Button
              key={index}
              variant={index === activeIndex ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                index === activeIndex && "bg-secondary"
              )}
              onClick={() => handleClick(index, item.url)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.text}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SideMenu;
