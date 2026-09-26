import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import prisma from "../config/prisma";

export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded."
            });
        }

        const imagePath = `/uploads/profile/${req.file.filename}`;

        const user = await prisma.user.update({
            where: {
                id: req.user!.id
            },
            data: {
                profileImage: imagePath
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                profileImage: true,
                bio: true,
                college: true,
                course: true,
                year: true
            }
        });

        res.status(200).json({
            message: "Profile image uploaded successfully.",
            user
        });

    } catch (error: any) {

        res.status(500).json({
            message: error.message
        });

    }
};
