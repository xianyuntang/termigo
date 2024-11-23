import ServerCard from "./server-card";

const Workspace = () => {
  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
      <ServerCard label="Dysonshark" />
      <ServerCard label="Dysonshark" />
      <ServerCard label="Dysonshark" />
      <ServerCard label="Dysonshark" />
    </div>
  );
};

export default Workspace;
