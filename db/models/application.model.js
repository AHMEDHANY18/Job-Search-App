import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Applied' },
    resume: { type: String, required: true },
    coverLetter: { type: String, required: true },
    appliedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Application', applicationSchema);
