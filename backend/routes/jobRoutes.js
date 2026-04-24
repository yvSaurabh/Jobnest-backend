const express = require("express");
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobStats

} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createJob).get(protect, getJobs);
router.get("/stats/summary", protect, getJobStats);

router
     .route("/:id")
        .get(protect, getJobById)
        .put(protect, updateJob)
        .delete(protect, deleteJob);
    
module.exports = router;