let SECURITY_KEY = "";

export const getSecurityKey = function () {
  return SECURITY_KEY;
};

export const setSecurityKey = function (securityKey: string) {
  SECURITY_KEY = securityKey;
};
