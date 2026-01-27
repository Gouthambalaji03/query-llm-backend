import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (req: Request, res: Response) => Promise<void>;

export const async_handler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};
