"use strict";
const userMasterRoutes = require("./routes/userMaster.router");
const productMasterRoutes = require("./routes/productMaster.router");
const productCategoryRoutes = require("./routes/productCategory.router");
const cartItem = require("./routes/cartItem.router");
const orderMasterRoutes = require("./routes/orderMaster.router");
const CountryMaster = require("./routes/countrymaster.router");
const StateMaster = require("./routes/statemaster.router");
const CityMaster = require("./routes/citymaster.router");

const parentSubCategory = require("./routes/parentSubCategory.router");

const childParentCategory = require("./routes/childParentCategory.router");

const contactForm = require("./routes/contactForm.router");

const reports = require("./routes/reports.router");

const adminDash = require("./routes/adminDash.router");

const addressMaster = require("./routes/addressMaster.router");

const authRoutes = require("./routes/auth.router");

const newsletter = require("./routes/newsletter.router");

const reviewForm = require("./routes/reviewForm.router");

const { verifyToken } = require("./middleware/tokenverify");

module.exports = (app) => {
  app.use("/userMaster", verifyToken, userMasterRoutes);

  app.use("/auth", authRoutes);

  app.use("/productCategory", productCategoryRoutes);
  app.use("/productMaster", productMasterRoutes);
  app.use("/cartitem", verifyToken, cartItem);
  app.use("/ordermaster", orderMasterRoutes);
  app.use("/countrymaster", CountryMaster);
  app.use("/statemaster", StateMaster);
  app.use("/citymaster", CityMaster);

  app.use("/parentsubcategory", parentSubCategory);
  app.use("/childparentcategory", childParentCategory);

  app.use("/contactform", contactForm);

  app.use("/reports", reports);

  app.use("/admindash", verifyToken, adminDash);

  app.use("/addressmaster", addressMaster);

  app.use("/newsletter", newsletter);

  app.use("/reviewForm", reviewForm);
};
