import { NextFunction, Request, Response } from "express";

const loginController = {
  async login(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {},
  async refresh(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {},
  async logout(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {},
};

export default loginController;
