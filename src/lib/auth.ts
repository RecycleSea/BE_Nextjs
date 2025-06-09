import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getOtpExpiry(): Date {
  const minutes = parseInt(process.env.OTP_EXPIRY?.replace('m', '') || '10');
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function getResetTokenExpiry(): Date {
  const hours = parseInt(process.env.RESET_TOKEN_EXPIRY?.replace('h', '') || '1');
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
}

export function sanitizeUser(user: any) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}