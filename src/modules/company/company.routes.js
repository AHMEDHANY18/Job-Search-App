import { Router } from "express";
const router = Router();
import * as CC from "./company.controller.js";
import { auth } from "../../middelware/auth.js";
import { validate } from "../../middelware/validation.js";

/**
 * Create a new company
 */
router.post('/add', auth(['Company_HR']), CC.addCompany);

/**
 * Update company details
 */
router.patch("/update/:id", auth('Company_HR'), CC.updateCompany);

/**
 * Delete a company
 */
router.delete("/delete/:id", auth('Company_HR'), CC.deleteCompany);

/**
 * Search for companies by name, email, or industry
 */
router.get("/search", auth(['Company_HR', 'User']), CC.searchCompanyByName);

/**
 * Get company data and associated jobs
 */
router.get('/company/:companyId', auth('Company_HR'), CC.getCompanyDataAndJobs);

/**
 * Get all applications for a specific job
 */
router.get('/application/:id', auth('Company_HR'), CC.getApplicationsForJob);

/**
 * Get a downloadable Excel file of applications for a company on a specific date
 */
router.get('/excel', auth('Company_HR'), CC.getApplicationsForCompanyOnDate);

export default router;
