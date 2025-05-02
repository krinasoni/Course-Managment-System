import { User } from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/generateToken.js';
import { deleteMedia, uploadMedia } from '../utils/cloudinary.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All Fields are required."
            })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Email Already registered"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: hashPassword
        });
        return res.status(201).json({
            success: true,
            message: "Account created successfully"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Failed to register"
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All Fields are required."
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Email or password"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Email or password"
            })
        }
        generateToken(res, user, `Welcome Back ${user.name}`)
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Failed to Login"
        })
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged Out successfully",
            success: true
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Failed to Logout"
        })
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id
        const user = await User.findById(userId).select("-password").populate({
            path: "enrolledCourses",
            populate: {
                path: "creator",
                select: "name photoUrl"
            }
        })
        if (!user) {
            return res.status(401).json({
                message: "Profile not found",
                success: false
            })
        }
        return res.status(200).json({
            success: true,
            user
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Failed to Load User"
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.id
        const { name } = req.body
        const profilePhoto = req.file

        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({
                message: "User not found",
                success: false
            })
        }
        // extract publicId of the old image from the url if it exists
        if (user.photoUrl) {
            const publicId = user.photoUrl.split("/").pop().split(".")[0];
            deleteMedia(publicId)
        }

        //upload new photo
        const cloudResponse = await uploadMedia(profilePhoto.path);
        const photoUrl = cloudResponse.secure_url

        const updatedData = { name, photoUrl }
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password")

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile Updated successfully"
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Failed to Update profile"
        })
    }
}