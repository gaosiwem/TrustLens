import type { Request, Response } from "express";
import * as authService from "./auth.service.js";

export async function registerController(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function googleLoginController(req: Request, res: Response) {
  try {
    const { email, providerId } = req.body;
    const result = await authService.googleLogin(email, providerId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function requestPasswordResetController(
  req: Request,
  res: Response,
) {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
