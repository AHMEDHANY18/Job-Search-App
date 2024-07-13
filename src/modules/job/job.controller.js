import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../../service/email.js";
import { application, json } from "express";
import Job from "../../../db/models/job.model.js";
import Company from "../../../db/models/company.model.js";
import mongoose from "mongoose";
import User from "../../../db/models/user.model.js";
import Application from "../../../db/models/application.model.js";

// Async Handler
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            console.error(err); // Log error details to the console
            res.status(500).json({ msg: "catch error", err: err.message || err });
        });
    };
};
////////////////////////////////////////(AddJob)///////////////////////////////////////////////////////
export const addJob = asyncHandler(async (req, res, next) => {
    const {
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
        companyEmail
    } = req.body;

    const companyHR = req.user._id;
    const existingCompany = await Company.findOne({ companyEmail });
    if (!existingCompany) {
        return next(new Error({ msg: 'Company does not exist' }))
    }
    const newJob = new Job({
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
        company: existingCompany._id,
        addedBy: companyHR
    });
    await newJob.save();
    res.status(201).json({ message: 'Job created successfully', job: newJob });
});

////////////////////////////////////////(updateJob)///////////////////////////////////////////////////////
export const updateJob = asyncHandler(async (req, res, next) => {
    const jobId = req.params.id;
    const userId = req.user._id;
    const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body;
    const job = await Job.findById(jobId);
    if (!job) {
        return next(new Error("Job not found"));
    }
    job.jobTitle = jobTitle || job.jobTitle;
    job.jobLocation = jobLocation || job.jobLocation;
    job.workingTime = workingTime || job.workingTime;
    job.seniorityLevel = seniorityLevel || job.seniorityLevel;
    job.jobDescription = jobDescription || job.jobDescription;
    job.technicalSkills = technicalSkills || job.technicalSkills;
    job.softSkills = softSkills || job.softSkills;
    const updatedJob = await job.save();
    await sendMail(
        req.user.email,
        "Job Update Confirmation",
        `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; max-width: 500px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #333333; margin-bottom: 10px;">Job Update Confirmation</h2>
                <p style="color: #555555; font-size: 16px;">The job has been successfully updated.</p>
                <p style="color: #555555; font-size: 16px;">Job Title: ${updatedJob.jobTitle}</p>
                <p style="color: #777777; font-size: 14px;">If you did not request this update, please contact support.</p>
            </div>
        </div>`
    );
    res.status(200).json({ msg: 'Job updated successfully', job: updatedJob });
});

////////////////////////////////////////(daleteJob)///////////////////////////////////////////////////////
export const deleteJob = asyncHandler(async (req, res, next) => {
    const jobId = req.params.id;
    const userId = req.user._id;
    const job = await Job.findById(jobId);
    if (!job) {
        return next(new Error("Job not found"));
    }
    await Job.findByIdAndDelete(jobId);
    res.status(200).json({ msg: 'Job deleted successfully' });
});
////////////////////////////////////////////(getAllJobsWithCompany)/////////////////////////////////////////
export const getAllJobsWithCompany = asyncHandler(async (req, res, next) => {
    const jobs = await Job.find()
        .populate({
            path: 'company',
            select: 'companyName companyEmail _id'
        })
        .populate({
            path: 'addedBy',
            select: 'username email _id'
        });
    if (!jobs || jobs.length === 0) {
        return res.status(404).json({ msg: 'No jobs found' });
    }
    res.status(200).json({ jobs });
});

////////////////////////////////////////(getJobsByCompanyName)///////////////////////////////////////////////////////
export const getJobsByCompanyName = asyncHandler(async (req, res, next) => {
    const { companyName } = req.query;
    if (!companyName) {
        return next(new Error({ msg: 'Company name is required' }))
    }
    const company = await Company.findOne({ companyName });
    if (!company) {
        return next(new Error({ msg: 'Company not found' }))
    }
    const jobs = await Job.find({ company: company._id });
    if (!jobs || jobs.length === 0) {
        return next(new Error({ msg: 'No jobs found for this company' }))
    }
    res.status(200).json({ jobs });
});

////////////////////////////////////////(getFilteredJobs)///////////////////////////////////////////////////////
export const getFilteredJobs = asyncHandler(async (req, res, next) => {
    const {
        workingTime,
        jobLocation,
        seniorityLevel,
        jobTitle,
    } = req.body;

    const query = {};
    if (workingTime) {
        query.workingTime = workingTime;
    }
    if (jobLocation) {
        query.jobLocation = jobLocation;
    }
    if (seniorityLevel) {
        query.seniorityLevel = seniorityLevel;
    }
    if (jobTitle) {
        query.jobTitle = jobTitle;
    }

    const jobs = await Job.find(query)
        .populate({
            path: 'applications',
            select: 'user',
            populate: {
                path: 'user',
                select: 'name email'
            }
        });

    if (!jobs || jobs.length === 0) {
        return next(new Error({ msg: 'No jobs found matching the criteria' }));
    }

    res.status(200).json({ jobs });
});

////////////////////////////////////////(applyjob)///////////////////////////////////////////////////////
export const applyToJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return next(new Error({ msg: 'Invalid job ID' }))
    }

    const job = await Job.findById(jobId);
    if (!job) {
        return next (new Error({ msg: 'Invalid job ID' }))
    }

    const user = await User.findById(userId);
    if (!user) {
        return next (new Error({ msg: 'User not found' }))
    }

    const resume = req.files['resume'][0].path;
    const coverLetter = req.files['coverLetter'][0].path;
    if (!resume || !coverLetter) {
            return next (new Error({ msg: 'Resume and cover letter are required' }))
    }

    const newApplication = await Application.create({
        job: jobId,
        user: userId,
        resume,
        coverLetter
    });

    job.applications.push(newApplication._id);
    await job.save();

    res.status(201).json({
        msg: 'Application submitted successfully',
        application: newApplication
    });
});