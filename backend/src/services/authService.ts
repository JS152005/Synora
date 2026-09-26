import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    RegisterUser,
    LoginUser,
    UpdateProfile
} from "../models/userModel";

export const testAuthService = () => {
    return {
        message: "Auth Service Working"
    };
};

export const registerService = async (user: RegisterUser) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email: user.email
        }
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await prisma.user.create({
        data: {
            fullName: user.fullName,
            email: user.email,
            password: hashedPassword
        }
    });

    return {
        message: "User Registered Successfully",
        user: {
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email
        }
    };

};

export const loginService = async (user: LoginUser) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email: user.email
        }
    });

    if (!existingUser) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        user.password,
        existingUser.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: existingUser.id,
            email: existingUser.email
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "7d"
        }
    );

    return {
        message: "Login Successful",
        token,
        user: {
            id: existingUser.id,
            fullName: existingUser.fullName,
            email: existingUser.email
        }
    };

};

export const getMeService = async (userId: string) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
            bio: true,
            college: true,
            course: true,
            year: true,
            createdAt: true
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;

};

export const updateProfileService = async (
    userId: string,
    data: UpdateProfile
) => {

    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data,
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

    return {
        message: "Profile Updated Successfully",
        user
    };

};