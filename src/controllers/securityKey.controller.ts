import { Request, Response } from "express";
import { securityKeyService } from "../services";
import { encrypt, getPrivateKey, getSecurityKey } from "../constants/constants";
export const setSecurityKey = async (req: any, res: any): Promise<any> => {
  try {
    if (!req.body.securityKey) {
      return res.http401("securityKey is required");
    }
    securityKeyService.setSecurityKeyForEncryption(req.body.securityKey);
    return res.http200({});
  } catch (err) {
    console.error(err);
  }
};

export const doEncryption = async (req: any, res: any): Promise<any> => {
  try {
    return res.http200({ token: encrypt(req.body.data, req.body.key) });
  } catch (err) {
    console.error(err);
  }
};
