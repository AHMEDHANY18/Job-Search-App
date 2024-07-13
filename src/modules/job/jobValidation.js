import joi from 'joi';

export const addJobValidation = {
    body: joi.object({
        jobTitle: joi.string().min(3).max(100).required(),
        jobLocation: joi.string().valid('onsite', 'remotely', 'hybrid').required(),
        workingTime: joi.string().valid('part-time', 'full-time').required(),
        seniorityLevel: joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO').required(),
        jobDescription: joi.string().min(10).max(2000).required(),
        technicalSkills: joi.array().items(joi.string().min(1)).min(1).required(),
        softSkills: joi.array().items(joi.string().min(1)).min(1).required(),
        addedBy: joi.string().required(),
    }),
};
export const updateJobValidation = {
    body: joi.object({
        jobTitle: joi.string().min(3).max(100).optional(),
        jobLocation: joi.string().valid('onsite', 'remotely', 'hybrid').optional(),
        workingTime: joi.string().valid('part-time', 'full-time').optional(),
        seniorityLevel: joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO').optional(),
        jobDescription: joi.string().min(10).max(1000).optional(),
        technicalSkills: joi.array().items(joi.string()).optional(),
        softSkills: joi.array().items(joi.string()).optional(),
    }),
    params: joi.object({
        id: joi.string().required(),
    }),
};

export const deleteJobValidation = {
    params: joi.object({
        id: joi.string().required(),
    }),
};
