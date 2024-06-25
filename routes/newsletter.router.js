const express = require("express");
const newsletterController = require("../controllers/newsletter.controller");
const router = express.Router();

router.post("/addnewsletter", newsletterController.addNewsletter);

router.post("/getallnewsletter", newsletterController.getAllNewsLetterData);

module.exports = router;
