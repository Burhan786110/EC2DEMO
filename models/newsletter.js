const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const table_name = "newsletter";


const Newsletter = sequelize.define(
    table_name,
    {
      newsletterSubscriberID: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
  
      emailAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
);

module.exports = Newsletter