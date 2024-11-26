import HostCard from "./host-card";

const HostsPageContainer = () => {
  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
      <HostCard host={{ id: "dyson", label: "DysonShark" }} />
    </div>
  );
};

export default HostsPageContainer;
