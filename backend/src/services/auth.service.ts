import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessTokenOptions: SignOptions = { expiresIn: config.jwt.expiresIn as any };
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      accessTokenOptions
    );

    const refreshTokenOptions: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as any };
    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      refreshTokenOptions
    );

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refresh_tokens.create({
      data: {
        id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        token: refreshToken,
        userId: user.id,
        expiresAt,
        createdAt: new Date(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token: string) {
    const storedToken = await prisma.refresh_tokens.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    if (!storedToken.user.isActive) {
      throw new AppError('User is inactive', 401);
    }

    const decoded = jwt.verify(token, config.jwt.refreshSecret) as {
      userId: string;
    };

    if (decoded.userId !== storedToken.userId) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessTokenOptions: SignOptions = { expiresIn: config.jwt.expiresIn as any };
    const accessToken = jwt.sign(
      {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
      config.jwt.secret,
      accessTokenOptions
    );

    return {
      accessToken,
    };
  },

  async logout(token: string) {
    await prisma.refresh_tokens.deleteMany({
      where: { token },
    });
  },

  async getMe(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },
};
