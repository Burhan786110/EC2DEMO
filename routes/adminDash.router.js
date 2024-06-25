const express = require("express");
const adminDashController = require("../controllers/adminDash.controller");
const router = express.Router();


router.get("/allcount", adminDashController.getAllAdminCount);

router.get("/productcount", adminDashController.getProductStatusCounts);

router.get("/getcurrentweeksales", adminDashController.getCurrentWeekSalesData)

module.exports = router;
