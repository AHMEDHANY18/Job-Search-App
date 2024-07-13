import { Schema, model, Types } from "mongoose";
import Application from "./application.model.js"; // Ensure this path is correct

const jobSchema = new Schema({
    jobTitle: { type: String, required: true },
    jobLocation: { type: String, enum: ['onsite', 'remotely', 'hybrid'], required: true },
    workingTime: { type: String, enum: ['part-time', 'full-time'], required: true },
    seniorityLevel: { type: String, enum: ['Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO'], required: true },
    jobDescription: { type: String, required: true },
    technicalSkills: { type: [String], required: true },
    softSkills: { type: [String], required: true },
    addedBy: { type: Types.ObjectId, ref: 'User', required: true },
    company: { type: Types.ObjectId, ref: 'Company' },
    applications: [{ type: Types.ObjectId, ref: 'Application' }] // Ensure this is defined correctly
}, { timestamps: true });

const Job = model('Job', jobSchema);

export default Job;
