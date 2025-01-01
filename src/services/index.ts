import FutureServiceClass from "./future.service";
import HostServiceClass from "./host.service";
import identityServiceClass from "./identity.service";
import PrivateKeyServiceClass from "./private-key.service";

const privateKeyService = new PrivateKeyServiceClass();
const hostService = new HostServiceClass();
const identityService = new identityServiceClass();
const futureService = new FutureServiceClass();

export { futureService, hostService, identityService, privateKeyService };
