import { Request, Response } from 'express';
import { async_handler } from '@/utils/async_handler';

export const get_me = async_handler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = req.user!;

  res.status(200).json({
    success: true,
    data: user.toJSON(),
  });
});
