import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User.model';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export function generateAccessToken(user: IUser): string {
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn'] };
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    options
  );
}

export function generateRefreshToken(user: IUser): string {
  const options: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '30d') as SignOptions['expiresIn'] };
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    options
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || 'refresh_secret'
  ) as TokenPayload;
}

export function setRefreshTokenCookie(res: import('express').Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}
