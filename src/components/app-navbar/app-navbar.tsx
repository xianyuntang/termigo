import TerminalShortcuts from "./terminal-shortcuts";

const AppNavbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-12 items-center px-2">
        <TerminalShortcuts />
      </nav>
    </header>
  );
};

export default AppNavbar;
