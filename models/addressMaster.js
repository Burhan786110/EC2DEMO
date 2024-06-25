const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const table_name = "addressMaster";
const UserMaster = require("./userMaster");
const CityMaster = require("./citymaster");
const CountryMaster = require("./countrymaster");
const StateMaster = require("./statemaster");

const AddressMaster = sequelize.define(table_name, {
  addressMasterID: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },

  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  emailAddress: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  mobileNo: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },

  shippingAddress: {
    type: Sequelize.TEXT,
    allowNull: true,
  },

  billingAddress: {
    type: Sequelize.TEXT,
    allowNull: false,
  },

  zipCode: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});
AddressMaster.belongsTo(UserMaster, {
  foreignKey: { name: "userMasterID" },
});

AddressMaster.belongsTo(CityMaster, {
  foreignKey: { name: "cityMasterID" },
});

AddressMaster.belongsTo(StateMaster, {
  foreignKey: { name: "stateMasterID" },
});

AddressMaster.belongsTo(CountryMaster, {
  foreignKey: { name: "countryMasterID" },
});

module.exports = AddressMaster;
