const { includes } = require("lodash");
const AddressMaster = require("../models/addressMaster");
const UserMaster = require("../models/userMaster");
const CityMaster = require("../models/citymaster");
const CountryMaster = require("../models/countrymaster");
const StateMaster = require("../models/statemaster");
const { log } = require("winston");

// Add new Address
exports.createAddress = async (req, res, next) => {
  try {
    const {
      userMasterID,
      firstName,
      lastName,
      emailAddress,
      mobileNo,
      shippingAddress,
      billingAddress,
      zipCode,
      cityMasterID,
      stateMasterID,
      countryMasterID,
    } = req.body;

    const phoneNumberRegex = /^\d{10}$/;
    if (!phoneNumberRegex.test(mobileNo)) {
      return res.status(200).json({
        status: 400,
        message: "Phone number should contain exactly 10 digits.",
      });
    }

    // constzipCodeRegex = /^\d{6}$/;
    // if (!phoneNumberRegex.test(zipCode)) {
    //   return res.status(200).json({
    //     status: 400,
    //     message: "Zip Code should contain exactly 6 digits.",
    //   });
    // }

    // Check if userMasterID exists
    const user = await UserMaster.findByPk(userMasterID);
    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid userMasterID" });
    }

    const addressCount = await AddressMaster.count({
      where: { userMasterID, status: 0 },
    });

    console.log(addressCount, "--");

    if (addressCount >= 5) {
      return res.status(200).json({
        status: 400,
        message: "Address limit reached. You can only have up to 5 addresses.",
      });
    }
    const newAddress = await AddressMaster.create({
      userMasterID,
      firstName,
      lastName,
      emailAddress,
      mobileNo,
      shippingAddress,
      billingAddress,
      zipCode,
      cityMasterID,
      stateMasterID,
      countryMasterID,
    });
    res.status(200).json({
      status: 200,
      data: newAddress,
      message: "Address Added Succesfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
    next(error);
  }
};

// edit address
exports.updateAddress = async (req, res, next) => {
  const { addressMasterID } = req.params;
  const {
    firstName,
    lastName,
    emailAddress,
    mobileNo,
    shippingAddress,
    billingAddress,
    zipCode,
  } = req.body;

  try {
    const phoneNumberRegex = /^\d{10}$/;
    if (!phoneNumberRegex.test(mobileNo)) {
      return res.status(200).json({
        status: 400,
        message: "Phone number should contain exactly 10 digits.",
      });
    }

    // constzipCodeRegex = /^\d{6}$/;
    // if (!phoneNumberRegex.test(zipCode)) {
    //   return res.status(200).json({
    //     status: 400,
    //     message: "Zip Code should contain exactly 6 digits.",
    //   });
    // }

    const address = await AddressMaster.findByPk(addressMasterID);
    if (address) {
      address.firstName = firstName;
      address.lastName = lastName;
      address.emailAddress = emailAddress;
      address.mobileNo = mobileNo;
      address.shippingAddress = shippingAddress;
      address.billingAddress = billingAddress;
      (address.zipCode = zipCode), await address.save();
      res.status(200).json({
        status: 200,
        data: address,
        message: "Address Update Successfully",
      });
    } else {
      res.status(404).json({ status: 404, message: "Address not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
    next(error);
  }
};

//Delete address
exports.deleteAddress = async (req, res, next) => {
  const { addressMasterID } = req.params;
  try {
    const address = await AddressMaster.findByPk(addressMasterID);
    if (address) {
      await address.update({ status: "1" }, { where: { addressMasterID } });
      res
        .status(200)
        .json({ status: 200, message: "Address deleted successfully" });
    } else {
      res.status(404).json({ status: 404, message: "Address not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
    next(error);
  }
};

//get all address details
exports.getAllAddressesByUser = async (req, res, next) => {
  const { userMasterID } = req.params;

  try {
    // Check if userMasterID exists
    const user = await UserMaster.findByPk(userMasterID);
    if (!user) {
      return res.status(400).json({ error: "Invalid userMasterID" });
    }

    // Find all addresses for the given userMasterID
    const addresses = await AddressMaster.findAndCountAll({
      where: { userMasterID, status: 0 },
    });

    res.status(200).json({
      status: 200,
      message: "sucessfully get all address",
      data: addresses.rows,
      totalcount: addresses.count,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
    next(error);
  }
};

exports.getAddressById = async (req, res, next) => {
  const { addressMasterID } = req.params;
  try {
    const address = await AddressMaster.findByPk(addressMasterID, {
      include: [
        {
          model: CountryMaster,
          attributes: ["countryName"],
        },
        { 
          model: StateMaster,
          attributes: ["stateName"],
        },
        {
          model: CityMaster,
          attributes: ["cityName"],
        },
      ],
    });


    res.status(200).json({
      status: 200,
      message: "Address fetched successfully",
      data: address,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
    next(error);
  }
};
