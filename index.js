import dotenv from 'dotenv';
import connectiontDB from './db/connectionDB.js';
import express from 'express';
import userRouter from './src/modules/user/user.routes.js';
import jobRouter from './src/modules/job/job.routes.js';
import companyRouter from './src/modules/company/company.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT;
connectiontDB();
app.use(express.json());

app.use('/user', userRouter);
app.use('/job', jobRouter);
app.use('/company', companyRouter);

app.use('*', (req, res, next) => {
    // Handle invalid requests
    const err = new Error(`Invalid request ${req.originalUrl}`);
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    res.status(400).json({ msg: 'Error', err: err.message });
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
