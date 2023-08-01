import { Request, Response } from "express";
import { userService } from "../services";

export const getUser = async (req: any, res: any): Promise<any> => {
  try {
    res.http200({});
  } catch (err) {
    console.error(err);
  }
};
