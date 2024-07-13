import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../../service/email.js";
import { json } from "express";
import Company from "../../../db/models/company.model.js";
import Job from "../../../db/models/job.model.js";
import Application from "../../../db/models/application.model.js";
import { generateExcel } from "../../../Utility/excel.js";
// Async Handler
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            console.error(err); // Log error details to the console
            res.status(500).json({ msg: "catch error", err: err.message || err });
        });
    };
};
// Add Company
export const addCompany = asyncHandler(async (req, res, next) => {
    const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;
    const companyHR = req.user._id;
    const existingCompany = await Company.findOne({ companyEmail });
    if (existingCompany) {
        return res.status(400).json({ msg: 'Company already exists' });
    }
    const newCompany = await Company.create({
        companyName,
        description,
        industry,
        address,
        numberOfEmployees,
        companyEmail,
        companyHR
    });
    res.status(201).json({ message: 'Company created successfully', company: newCompany });
});

// Update Company
export const updateCompany = asyncHandler(async (req, res, next) => {
    const companyId = req.params.id;
    const userId = req.user._id;
    const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;
    const company = await Company.findById(companyId);
    if (!company) {
        return next(new Error("Company not found"));
    }
    if (companyName) company.companyName = companyName;
    if (description) company.description = description;
    if (industry) company.industry = industry;
    if (address) company.address = address;
    if (numberOfEmployees) company.numberOfEmployees = numberOfEmployees;
    if (companyEmail) company.companyEmail = companyEmail;
    await company.save();
    await sendMail(
        req.user.email,
        "Company Update Confirmation",
        `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; max-width: 500px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #333333; margin-bottom: 10px;">Company Update Confirmation</h2>
                <p style="color: #555555; font-size: 16px;">Your company details have been successfully updated.</p>
                <p style="color: #555555; font-size: 16px;">Company Name: ${company.companyName}</p>
                <p style="color: #555555; font-size: 16px;">Description: ${company.description}</p>
                <p style="color: #555555; font-size: 16px;">Industry: ${company.industry}</p>
                <p style="color: #555555; font-size: 16px;">Address: ${company.address}</p>
                <p style="color: #555555; font-size: 16px;">Number of Employees: ${company.numberOfEmployees}</p>
                <p style="color: #555555; font-size: 16px;">Company Email: ${company.companyEmail}</p>
                <p style="color: #777777; font-size: 14px;">If you did not request this update, please contact support.</p>
            </div>
        </div>`
    );
    res.status(200).json({ msg: 'Company updated successfully', company });
});

// Delete Company
export const deleteCompany = asyncHandler(async (req, res, next) => {
    const companyId = req.params.id;
    const userId = req.user._id;
    const company = await Company.findById(companyId);
    if (!company) {
        return next(new Error("Company not found"));
    }
    await Company.findByIdAndDelete(userId);
    await sendMail(
        req.user.email,
        "Company Deletion Confirmation",
        `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; max-width: 500px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #333333; margin-bottom: 10px;">Company Deletion Confirmation</h2>
                <p style="color: #555555; font-size: 16px;">Your company has been successfully deleted.</p>
                <p style="color: #555555; font-size: 16px;">Company Name: ${company.companyName}</p>
                <p style="color: #777777; font-size: 14px;">If you did not request this deletion, please contact support.</p>
            </div>
        </div>`
    );
    res.status(200).json({ msg: 'Company deleted successfully' });
});

// Search Company by Name, Email, or Industry
export const searchCompanyByName = asyncHandler(async (req, res, next) => {
    const { companyName, companyEmail, industry } = req.query;
    if (!companyName && !companyEmail && !industry) {
        return res.status(400).json({ msg: "At least one search parameter (companyName, companyEmail, or industry) is required" });
    }
    const query = {};

    if (companyName) {
        const regex = new RegExp(companyName, 'i');
        query.companyName = { $regex: regex };
    }
    if (companyEmail) {
        query.companyEmail = companyEmail;
    }
    if (industry) {
        query.industry = industry;
    }
    const companies = await Company.find(query);
    if (companies.length === 0) {
        return res.status(404).json({ msg: "No companies found with the specified criteria" });
    }
    res.status(200).json({ companies });
});

// Get Company Data and Jobs
export const getCompanyDataAndJobs = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    if (!companyId) {
        return res.status(400).json({ msg: 'Company ID is required' });
    }
    const company = await Company.findById(companyId);
    if (!company) {
        return res.status(404).json({ msg: 'Company not found' });
    }
    const jobs = await Job.find({ company: company._id });
    res.status(200).json({
        company,
        jobs
    });
});

// Get Applications for a Job
export const getApplicationsForJob = asyncHandler(async (req, res, next) => {
    const jobId = req.params.id;
    const userId = req.user._id;
    const job = await Job.findById(jobId)
        .populate({
            path: 'company',
            select: 'companyName companyEmail companyHR'
        })
        .populate({
            path: 'applications',
            populate: {
                path: 'user',
                select: 'name email'
            }
        });

    if (!job) {
        return res.status(404).json({ msg: 'Job not found' });
    }
    const applications = job.applications;
    res.status(200).json({ applications });
});

// Get Applications for a Company on a Specific Date and Generate Excel
export const getApplicationsForCompanyOnDate = asyncHandler(async (req, res, next) => {
    const { companyId, date } = req.query;
    const userId = req.user._id;
    const company = await Company.findById(companyId);
    if (!company) {
        return next(new Error('Company not found'));
    }
    const applications = await Application.find({
        job: { $in: await Job.find({ company: companyId }).select('_id') },
        appliedAt: {
            $gte: new Date(date).setHours(0, 0, 0, 0),
            $lte: new Date(date).setHours(23, 59, 59, 999)
        }
    }).populate('user').populate('job');
    const workbook = generateExcel(applications);
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename=applications.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});
