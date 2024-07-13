import joi from "joi";

export const addCompanyValidation = {
    body: joi.object({
        companyName: joi.string().min(3).max(100).required(),
        description: joi.string().min(10).max(1000).required(),
        industry: joi.string().min(3).max(50).required(),
        address: joi.string().min(10).max(200).required(),
        numberOfEmployees: joi.string().valid ('11-20' ).required(),
        companyEmail: joi.string().email().required(),
    }),
};

export const updateCompanyValidation = {
    body: joi.object({
        companyName: joi.string().min(3).max(100).optional(),
        description: joi.string().min(10).max(1000).optional(),
        industry: joi.string().min(3).max(50).optional(),
        address: joi.string().min(10).max(200).optional(),
        numberOfEmployees: joi.string().valid('11-20').optional(),
        companyEmail: joi.string().email().optional(),
    }),
};

export const deleteCompanyValidation = {
    params: joi.object({
        id: joi.string().required(),
    }),
};

export const searchCompanyValidation = {
    body: joi.object({
        companyName: joi.string().min(1).optional(),
        companyEmail:joi.string().email().optional(),
        industry: joi.string().optional(),
    }),
};
