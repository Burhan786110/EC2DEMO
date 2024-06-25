const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const table_name = "reviewForm";
const UserMaster = require("./userMaster");
const productMaster = require("./productMaster");

const ReviewForm = sequelize.define(
  table_name,
  {
    reviewFormID: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    ratings: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },

    reviewTitle: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    reviewComments: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    createBy: {
      type: Sequelize.INTEGER,
    },

    updateBy: {
      type: Sequelize.INTEGER,
    },

    deleteBy: {
      type: Sequelize.INTEGER,
    },

    createByIp: {
      type: Sequelize.STRING,
    },

    updateByIp: {
      type: Sequelize.STRING,
    },

    deleteByIp: {
      type: Sequelize.STRING,
    },
  },
  { paranoid: true }
);

ReviewForm.belongsTo(UserMaster, {
  foreignKey: { name: "userMasterID" },
});

ReviewForm.belongsTo(productMaster, {
  foreignKey: { name: "productMasterID" },
});

module.exports = ReviewForm;
