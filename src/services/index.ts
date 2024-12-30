import FutureServiceClass from "./future.service";
import HostServiceClass from "./host.service";
import identityServiceClass from "./identity.service";
import PublicKeyServiceClass from "./public-key.service";

const publicKeyService = new PublicKeyServiceClass();
const hostService = new HostServiceClass();
const identityService = new identityServiceClass();
const futureService = new FutureServiceClass();

export { futureService, hostService, identityService, publicKeyService };
