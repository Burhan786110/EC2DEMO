const express = require("express");
const ReportsController = require("../controllers/reports.controller");
const router = express.Router();

router.get("/productsellingreport", ReportsController.productSellingReport);

router.post("/orderreport", ReportsController.getOrderDetailReport);

// router.post("/orderDataForAdmin", ReportsController.getOrderDataForAdmin);

router.post("/orderreportformonth", ReportsController.getTotalSalesByMonthYear);


module.exports = router;
