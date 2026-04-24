const Job = require("../models/Job");

// Validation helper
const validateJobData = (company, role) => {
    const errors = [];
    
    if (!company || !company.trim()) {
        errors.push("Company name is required");
    } else if (company.trim().length < 2) {
        errors.push("Company name must be at least 2 characters");
    }
    
    if (!role || !role.trim()) {
        errors.push("Job role is required");
    } else if (role.trim().length < 2) {
        errors.push("Job role must be at least 2 characters");
    }
    
    return { valid: errors.length === 0, errors };
};

const validStatuses = ["applied", "shortlisted", "interview", "offer", "rejected"];
const normalizeStatus = (status) =>
    typeof status === "string" ? status.trim().toLowerCase() : "";

const createJob = async(req, res) => {
    try {
        const {
            company,
            role,
            location,
            jobType,
            status,
            jobLink,
            appliedDate,
            deadline,
            salary,
            source,
            notes,
        } = req.body;

        // Validate required fields
        const validation = validateJobData(company, role);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.errors.join(", "),
            });
        }

        // Validate status if provided
        const normalizedStatus = normalizeStatus(status);

        if (status && !validStatuses.includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job status. Must be one of: applied, shortlisted, interview, offer, rejected",
            });
        }

        const job = await Job.create({
            user: req.user._id,
            company: company.trim(),
            role: role.trim(),
            location,
            jobType,
            status: normalizedStatus || undefined,
            jobLink,
            appliedDate,
            deadline,
            salary,
            source,
            notes,
        });

        res.status(201).json({
            success: true,
            message: "Job created successfully",
            data: job,
        });
        
        
        
    } catch (error) {
        console.error("Create job error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating job",
        });
    }
};

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({user: req.user._id}).sort({createdAt: -1});

        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            count: jobs.length,
            data: jobs,
        });
    } catch(error){
        console.error("Get jobs error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching jobs",
        });
    }
};

const getJobById = async (req, res) =>{
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID format",
            });
        }

        const job = await Job.findOne({_id: id, user: req.user._id});

        if(!job){
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            data: job,
        });
    } catch(error) {
        console.error("Get job by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching job",
        });
    }
};

const updateJob = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID format",
            });
        }

        const job = await Job.findOne({
            _id: id,
            user: req.user._id,
        });
            
        if(!job){
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // Validate status if being updated
        const normalizedStatus = normalizeStatus(req.body.status);

        if (req.body.status && !validStatuses.includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job status. Must be one of: applied, shortlisted, interview, offer, rejected",
            });
        }

        const updatePayload = {
            ...req.body,
            ...(req.body.status ? { status: normalizedStatus } : {}),
        };

        const updateJob = await Job.findByIdAndUpdate(id, updatePayload, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            data: updateJob,
        });
    } catch(error) {
        console.error("Update job error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating job",
        });
    }
};

const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job ID format",
            });
        }

        const job = await Job.findOne({
            _id: id,
            user: req.user._id,
        });

        if(!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }
        await job.deleteOne();

        res.status(200).json({
            success: true,
            message: "Job deleted successfully",
        });
    } catch(error) {
        console.error("Delete job error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting job",
        });
    }

};

const getJobStats = async (req, res) => {
    try {
        const jobs = await Job.find({ user: req.user._id});

        const stats = {
            total: jobs.length,
            applied: jobs.filter((job)=> normalizeStatus(job.status) === "applied").length,
            shortlisted: jobs.filter((job)=> normalizeStatus(job.status) === "shortlisted").length,
            interview: jobs.filter((job)=> normalizeStatus(job.status) === "interview").length,
            offer: jobs.filter((job)=> normalizeStatus(job.status) === "offer").length,
            rejected: jobs.filter((job)=> normalizeStatus(job.status) === "rejected").length,
        };

        res.status(200).json({
            success: true,
            message: "Job statistics fetched successfully",
            data: stats,
        });
    } catch (error) {
        console.error("Get job stats error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching job statistics",
        });
    }
};
module.exports = { 
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobStats,
};
