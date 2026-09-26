import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { UpdateProfile } from "../models/userModel";

import {
    getMeService,
    updateProfileService,
    searchUsersService,
    discoverUsersService,
    getPublicProfileService,
    getRecommendationsService
} from "../services/userService";

/**
 * ==========================================================
 * My Profile
 * ==========================================================
 */

export const getMe = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const user = await getMeService(req.user!.id);

        res.status(200).json(user);

    } catch (error: any) {

        res.status(404).json({
            message: error.message
        });

    }

};

/**
 * ==========================================================
 * Update Profile
 * ==========================================================
 */

export const updateProfile = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const profile: UpdateProfile = req.body;

        const result = await updateProfileService(
            req.user!.id,
            profile
        );

        res.status(200).json(result);

    } catch (error: any) {

        res.status(400).json({
            message: error.message
        });

    }

};

/**
 * ==========================================================
 * Search Users
 * ==========================================================
 */

export const searchUsers = async (
    req: Request,
    res: Response
) => {

    try {

        const search =
            req.query.search as string | undefined;

        const users =
            await searchUsersService(search);

        res.status(200).json(users);

    } catch (error: any) {

        res.status(500).json({
            message: error.message
        });

    }

};

/**
 * ==========================================================
 * Discover Users
 * ==========================================================
 */

export const discoverUsers = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const users =
            await discoverUsersService({

                currentUserId: req.user!.id,

                page,

                limit,

                name:
                    req.query.name as string,

                subjectId:
                    req.query.subjectId as string,

                topicId:
                    req.query.topicId as string,

                college:
                    req.query.college as string,

                course:
                    req.query.course as string,

                year:
                    req.query.year
                        ? String(req.query.year)
                        : undefined

                        
            });

        res.status(200).json(users);

    } catch (error: any) {

        res.status(500).json({
            message: error.message
        });

    }

};

/**
 * ==========================================================
 * Public Profile
 * ==========================================================
 */

export const getPublicProfile = async (
    req: Request,
    res: Response
) => {

    try {

        const user =
            await getPublicProfileService(
                req.params.id
            );

        res.status(200).json(user);

    } catch (error: any) {

        res.status(404).json({
            message: error.message
        });

    }

};

/**
 * ==========================================================
 * Recommendations
 * ==========================================================
 */

export const getRecommendations = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const limit =
            Number(req.query.limit) || 10;

        const users =
            await getRecommendationsService(
                req.user!.id,
                limit
            );

        res.status(200).json(users);

    } catch (error: any) {

        res.status(500).json({
            message: error.message
        });

    }

};