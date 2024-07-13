import User from "../../../db/models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../../service/email.js";
import { json } from "express";

////////////////////////////////////////////////////////////////////////////////////////////
// Async Handler
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            console.error(err); // Log error details to the console
            res.status(500).json({ msg: "catch error", err: err.message || err });
        });
    };
};

////////////////////////////////////////////////////////////////////////////////////////////
// Signup
export const signup = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, username, email, password, recoveryEmail, DOB, mobileNumber, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new Error("Email already exists"));
    }
    const otp = Math.floor(Math.random() * 1000000) + 1;
    const otpExpiry = new Date(Date.now() + 10 * 60000);
    await sendMail(
        email,
        "OTP Verification",
        `<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 5px; overflow: hidden; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                <div style="background-color: #2196F3; color: #fff; padding: 10px; text-align: center;">
                    <h2 style="margin: 0;">OTP Verification</h2>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
                </div>
            </div>
        </div>`
    );
    const hash = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
        firstName,
        lastName,
        username,
        email,
        password: hash,
        recoveryEmail,
        DOB,
        mobileNumber,
        role,
        otp,
        otpExpiry
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
});

////////////////////////////////////////////////////////////////////////////////////////////
// Confirm Email
export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { otp } = req.body;
    const user = await User.findOne({ otp, otpExpiry: { $gt: Date.now() } });
    if (!user) {
        return next(new Error("Invalid OTP or OTP Expiry"));
    }
    user.confirmed = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ msg: "Email confirmed successfully" });
});

////////////////////////////////////////////////////////////////////////////////////////////
// Sign In
export const signin = asyncHandler(async (req, res, next) => {
    const { email, recoveryEmail, mobileNumber, password } = req.body;
    const user = await User.findOne({
        $or: [{ email }, { recoveryEmail }, { mobileNumber }],
        confirmed: true
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return next(new Error("Invalid email or password"));
    }
    user.status = 'online';
    await user.save();
    const token = jwt.sign({ id: user._id }, "ahmed", { expiresIn: '10d' });
    res.status(200).json({ token });
});
////////////////////////////////////////////////////////////////////////////////////////////
// Update Account
export const update = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { email, recoveryEmail, mobileNumber, DOB, lastName, firstName } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        return next(new Error("User not found"));
    }
    if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail && existingEmail._id.toString() !== userId) {
            return next(new Error("Email already in use"));
        }
        user.email = email;
    }
    if (mobileNumber) {
        const existingMobile = await User.findOne({ mobileNumber });
        if (existingMobile && existingMobile._id.toString() !== userId) {
            return next(new Error("Mobile number already in use"));
        }
        user.mobileNumber = mobileNumber;
    }
    if (DOB) user.DOB = DOB;
    if (lastName) user.lastName = lastName;
    if (firstName) user.firstName = firstName;
    if (recoveryEmail) user.recoveryEmail = recoveryEmail;
    await user.save();
    res.status(200).json({ msg: 'User account updated successfully', user });
});

////////////////////////////////////////////////////////////////////////////////////////////
// Delete Account
export const deleteAccount = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        return next(new Error("User not found"));
    }
    //اعتقد دي ملهاش لازمه
    if (user.status !== 'online') {
    return next(new Error({ msg: 'User must be online to delete their account' }))
    }
    await User.findByIdAndDelete(userId);

    res.status(200).json({ msg: 'User account deleted successfully' });
});
////////////////////////////////////////////////////////////////////////////////////////////
// Get Account
export const getAcc = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new Error("User not found"));
    }
    res.status(200).json(user);
});

////////////////////////////////////////////////////////////////////////////////////////////
// Get Profile by ID
export const GetProfile = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
        return next(new Error("User not found"));
    }
    res.status(200).json({ user });
});

////////////////////////////////////////////////////////////////////////////////////////////
// Update Password
export const updatePassword = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        return next(new Error("User not found"));
    }
    if (!bcrypt.compareSync(currentPassword, user.password)) {
        return next(new Error("Current password is incorrect"));
    }
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedNewPassword;
    const email = user.email;
    await sendMail(
        email,
        "Password Update Confirmation",
        `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; max-width: 500px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #333333; margin-bottom: 10px;">Password Updated Successfully</h2>
                <p style="color: #555555; font-size: 16px;">Your password has been updated successfully. If you did not request this change, please contact support immediately.</p>
            </div>
        </div>`
    );
    await user.save();
    res.status(200).json({ msg: "Password updated successfully" });
});
////////////////////////////////////////////////////////////////
// request password to reset
export const requestPasswordReset = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new Error("User not found"));
    }
    const otp = Math.floor(Math.random() * 1000000) + 1;
    const otpExpiry = new Date(Date.now() + 15 * 60000);
await sendMail(
    email,
    "Password Reset OTP",
    `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; max-width: 500px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333333; margin-bottom: 10px;">Password Reset Request</h2>
            <p style="color: #555555; font-size: 16px;">We received a request to reset your password. Use the following OTP to complete the process:</p>
            <div style="background-color: #2196F3; color: #ffffff; border-radius: 5px; padding: 15px; margin: 20px 0; font-size: 24px; font-weight: bold;">
                ${otp}
            </div>
            <p style="color: #777777; font-size: 14px;">If you did not request this password reset, please ignore this email.</p>
        </div>
    </div>`
);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    res.status(200).json({ msg: "OTP sent to your email" });
});
//////////////////////////////////////////////////////////////////////
//rese password
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return next(new Error("Email, OTP, and new password are required"));
    }
    const user = await User.findOne({ otp, otpExpiry: { $gt: Date.now() } });
    if (!user) {
        return next(new Error("User not found"));
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({ msg: "Password reset successfully" });
});
/////////////////////////////////////////////////////
export const getAccountsByRecoveryEmail = asyncHandler(async (req, res, next) => {
    const { recoveryEmail } = req.body;
    if (!recoveryEmail) {
        return next(new Error("Recovery email is required"));
    }
    const users = await User.find({ recoveryEmail });
    if (users.length === 0) {
        return res.status(404).json({ msg: "No accounts found for the specified recovery email" });
    }
    res.status(200).json({ users });
});