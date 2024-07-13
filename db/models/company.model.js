import { Schema, model, Types } from "mongoose";

const companySchema = new Schema({
    companyName: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    address: { type: String, required: true },
    numberOfEmployees: {
        type: String,
        enum: ['11-20'],
        required: true
    },
    companyEmail: { type: String, required: true, unique: true },
    companyHR: { type: Types.ObjectId, ref: 'User', required: true } // Reference to User model
}, { timestamps: true });

const Company = model('Company', companySchema);

export default Company;
