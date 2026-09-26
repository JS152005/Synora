import { Request, Response } from "express";
import {
    RegisterUser,
    LoginUser,
    UpdateProfile
} from "../models/userModel";

import {
    testAuthService,
    registerService,
    loginService,
    getMeService,
    updateProfileService
} from "../services/authService";

import { AuthRequest } from "../middleware/authMiddleware";

export const testAuth = (
    req: Request,
    res: Response
) => {

    const result = testAuthService();

    res.json(result);

};

export const register = async (
    req: Request,
    res: Response
) => {

    try {

        const user: RegisterUser = req.body;

        const result = await registerService(user);

        res.status(201).json(result);

    } catch (error: any) {

        res.status(400).json({
            message: error.message
        });

    }

};

export const login = async (
    req: Request,
    res: Response
) => {

    try {

        const user: LoginUser = req.body;

        const result = await loginService(user);

        res.status(200).json(result);

    } catch (error: any) {

        res.status(401).json({
            message: error.message
        });

    }

};

export const getMe = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const result = await getMeService(req.user!.id);

        res.status(200).json(result);

    } catch (error: any) {

        res.status(404).json({
            message: error.message
        });

    }

};

export const updateProfile = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const data: UpdateProfile = req.body;

        const result = await updateProfileService(
            req.user!.id,
            data
        );

        res.status(200).json(result);

    } catch (error: any) {

        res.status(400).json({
            message: error.message
        });

    }

};