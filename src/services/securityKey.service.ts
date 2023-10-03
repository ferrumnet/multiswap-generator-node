import { setSecurityKey, getSecurityKey } from "../constants/constants";

export const setSecurityKeyForEncryption = (securityKey: string) => {
  setSecurityKey((global as any).AWS_ENVIRONMENT.SECURITY_KEY + securityKey);
};
