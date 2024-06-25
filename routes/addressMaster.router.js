const express = require("express");
const addressMasterController = require("../controllers/addressMaster.controller");
const router = express.Router();

router.post("/addaddress",addressMasterController.createAddress);

router.put("/editaddress/:addressMasterID",addressMasterController.updateAddress);

router.delete("/deleteaddress/:addressMasterID",addressMasterController.deleteAddress);

router.get("/getaddressdetails/:userMasterID",addressMasterController.getAllAddressesByUser);

router.get("/getAddressById/:addressMasterID",addressMasterController.getAddressById);

module.exports = router;