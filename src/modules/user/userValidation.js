import Joi from 'joi';

// Signup validation
export const signupValidation = {
    body: Joi.object({
        firstName: Joi.string().min(1).max(50).required(),
        lastName: Joi.string().min(1).max(50).required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\\d!@#$%^&*(),.?":{}|<>]{8,}$')).required(),
        recoveryEmail: Joi.string().email().optional(),
        DOB: Joi.date().iso().required(),
        mobileNumber: Joi.string().pattern(/^01[0-2,5][0-9]{8}$/).required(),
        role: Joi.string().valid('User', 'Company_HR').required(),
        status: Joi.string().valid('online', 'offline').default('offline')
    })
};

// Signin validation
export const signinValidation = Joi.object({
    email: Joi.string().email().optional(),
    recoveryEmail: Joi.string().email().optional(),
    mobileNumber: Joi.string().pattern(/^01[0-2,5][0-9]{8}$/).optional(),
    password: Joi.string().required() // Added required password field
});

// Update account validation
export const updateAccountValidation = Joi.object({
    email: Joi.string().email().optional(),
    recoveryEmail: Joi.string().email().optional(),
    mobileNumber: Joi.string().pattern(/^01[0-2,5][0-9]{8}$/).optional(),
    DOB: Joi.date().iso().optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    firstName: Joi.string().min(1).max(50).optional(),
});

export const updatePasswordValidation = Joi.object({
    currentPassword: Joi.string()
    .required()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\\d!@#$%^&*(),.?":{}|<>]{8,}$')),
    newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\\d!@#$%^&*(),.?":{}|<>]{8,}$'))
});

export const requestPasswordResetValidation = Joi.object({
    email: Joi.string().email().required()
});

export const resetPasswordValidation = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.number().integer().min(100000).max(999999).required(),
    newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\\d!@#$%^&*(),.?":{}|<>]{8,}$')),
    newPassword: Joi.string()
});