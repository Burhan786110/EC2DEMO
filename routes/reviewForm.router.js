const express = require("express");
const reviewFormController = require("../controllers/reviewForm.controller");
const router = express.Router();

router.post("/addreview",reviewFormController.createReview);

router.post("/listreviewforadmin",reviewFormController.listReviewsForAdmin);

router.post("/reviewstatus/:id",reviewFormController.updateReviewStatus);

router.get("/reviewbyid/:reviewFormID",reviewFormController.getReviewById);

router.post("/getproductreviewbyid/:productMasterID",reviewFormController.getReviewByProductID);

router.get("/getproductpercentage/:productMasterID",reviewFormController.getReviewPercentageByProductID);

module.exports = router