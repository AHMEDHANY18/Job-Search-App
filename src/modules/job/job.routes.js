import { Router } from "express";
const router = Router();
import * as JC from "./job.controller.js";
import { auth } from "../../middelware/auth.js";
import { validate } from "../../middelware/validation.js";
import * as JV from "./jobValidation.js";
import { multerLocal } from "../../service/multer.js";

/**
 * Add a new job posting
 */
router.post('/add', auth(['Company_HR']), JC.addJob);

/**
 * Update job details
 */
router.patch('/updateJob/:id', auth('Company_HR'), validate(JV.updateJobValidation), JC.updateJob);

/**
 * Delete a job posting
 */
router.delete("/delete/:id", auth('Company_HR'), validate(JV.deleteJobValidation), JC.deleteJob);

/**
 * Get all jobs with company details
 */
router.get("/GetAllJob", auth(['Company_HR', 'User']), JC.getAllJobsWithCompany);

/**
 * Get jobs by company name
 */
router.get('/specific_company', auth(['Company_HR', 'User']), JC.getJobsByCompanyName);

/**
 * Get jobs with applied filters
 */
router.get('/jobsfilter', auth(['Company_HR', 'User']), JC.getFilteredJobs);

/**
 * Apply for a job with optional resume and cover letter
 */
router.post('/apply/:jobId', auth(['Company_HR', 'User']), multerLocal().fields([{ name: 'resume', maxCount: 1 }, { name: 'coverLetter', maxCount: 1 }]), JC.applyToJob);

export default router;
