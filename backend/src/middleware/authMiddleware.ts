import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

export interface AuthUser {
  id: string;
  email: string;
  personalEmail?: string | null;
  collegeEmail?: string | null;
  fullName: string;
  profileImage?: string | null;
  bio?: string | null;
  college?: string | null;
  collegeId?: string | null;
  course?: string | null;
  courseId?: string | null;
  year?: string | null;
  personalEmailVerified: boolean;
  collegeEmailVerified: boolean;
  isVerified: boolean;
  status: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Validates JWT token and loads current user profile from database.
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: "Access Denied. No Token Provided.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Invalid Token format.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      id: string;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        personalEmail: true,
        collegeEmail: true,
        fullName: true,
        profileImage: true,
        bio: true,
        college: true,
        collegeId: true,
        course: true,
        courseId: true,
        year: true,
        personalEmailVerified: true,
        collegeEmailVerified: true,
        isVerified: true,
        status: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User session not found or account removed.",
      });
      return;
    }

    if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
      res.status(403).json({
        success: false,
        message: "Your account is currently suspended or deactivated.",
      });
      return;
    }

    req.user = user as AuthUser;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or Expired Token.",
    });
  }
};

/**
 * Enforces that the authenticated user must be a fully verified medical student.
 * Blocks unverified users from accessing normal platform APIs.
 */
export const requireVerified = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  if (!req.user.personalEmailVerified && !req.user.isVerified) {
    res.status(403).json({
      success: false,
      code: "VERIFICATION_REQUIRED",
      message:
        "Access Denied. Personal email verification required to access this resource.",
      verificationStatus: {
        personalEmailVerified: req.user.personalEmailVerified,
        collegeEmailVerified: req.user.collegeEmailVerified,
        status: req.user.status,
      },
    });
    return;
  }

  next();
};

// Backward compatibility alias
export const verifyToken = authenticate;