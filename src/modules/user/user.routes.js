import { Router } from "express";
const router = Router();
import * as UC from "./user.controller.js";
import { auth } from "../../middelware/auth.js";
import { validate } from "../../middelware/validation.js";
import * as UV from "./userValidation.js";

/**
 * User registration/signup
 */
router.post("/signup", validate(UV.signupValidation), UC.signup);

/**
 * User login/signin
 */
router.post("/signin", validate(UV.signinValidation), UC.signin);

/**
 * Update user account details (requires authentication)
 */
router.patch("/update", auth('Company_HR'), validate(UV.updateAccountValidation), UC.update);

/**
 * Get authenticated user's account details
 */
router.get("/getacc", auth('Company_HR'), UC.getAcc);

/**
 * Get user profile by ID
 */
router.get("/profile/:id", UC.GetProfile);

/**
 * Update user password (for Company_HR role)
 */
router.patch('/updatePassword', auth(["Company_HR"]), validate(UV.updatePasswordValidation), UC.updatePassword);

/**
 * Request a password reset (e.g., for forgotten password)
 */
router.post("/requestPasswordReset", validate(UV.requestPasswordResetValidation), UC.requestPasswordReset);

/**
 * Reset user password using a token from the password reset request
 */
router.post("/resetPassword", validate(UV.resetPasswordValidation), UC.resetPassword);

/**
 * Get user accounts by recovery email (e.g., for password recovery)
 */
router.get("/accounts", UC.getAccountsByRecoveryEmail);

/**
 * Confirm email address (e.g., after registration or email change)
 */
router.post("/confirm", UC.confirmEmail);

export default router;
