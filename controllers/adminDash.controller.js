const sequelize = require("../config/database");
const ProductMaster = require("../models/productMaster");
const ProductCategory = require("../models/productCategory");
const ParentSubCategory = require("../models/parentSubCategory");
const OrderMaster = require("../models/orderMaster");
const UserMaster = require("../models/userMaster");
const CountryMaster = require("../models/countrymaster");
const StateMaster = require("../models/statemaster");
const CityMaster = require("../models/citymaster");
const NewsLetter = require("../models/newsletter");
const Contact = require("../models/contactForm");
const Sequelize = require("sequelize");
const { Op, fn, col } = require("sequelize");
const {
  getCurrentWeekDateRange,
  formatDate,
} = require("../utils/commonUtilFunctions"); // Adjust path as per your project structure

exports.getAllAdminCount = async (req, res, next) => {
  try {
    const parentSubCategoryCount = await ParentSubCategory.count();

    const categoryCount = await ProductCategory.count();

    const productCount = await ProductMaster.count();

    const orderCount = await OrderMaster.count();

    const userCount = await UserMaster.count();

    const contactCount = await Contact.count();

    const newsletterCount = await NewsLetter.count();

    const countryCount = await CountryMaster.count();

    const stateCount = await StateMaster.count();

    const cityCount = await CityMaster.count();

    const customerCount = await OrderMaster.count({
      distinct: true,
      col: "userMasterID",
    });

    const OrderRevenue = await OrderMaster.sum("amount");

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1);

    const OrderRevenueCurrentYear = await OrderMaster.sum("amount", {
      where: {
        createdAt: {
          [Op.gte]: startOfYear,
          [Op.lt]: endOfYear,
        },
      },
    });

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1
    );

    const OrderRevenueCurrentMonth = await OrderMaster.sum("amount", {
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lt]: endOfMonth,
        },
      },
    });

    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(24, 0, 0, 0));

    const OrderRevenueToday = await OrderMaster.sum("amount", {
      where: {
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        },
      },
    });

    const countData = {
      totalProductCategory: categoryCount,
      totalParentSubCategory: parentSubCategoryCount,
      totalProduct: productCount,
      totalOrder: orderCount,
      totalUsers: userCount,
      totalContactQuery: contactCount,
      totalNewsletter: newsletterCount,
      totalCountry: countryCount,
      totalState: stateCount,
      totalCity: cityCount,
      totalCustomer: customerCount,
      totalOrderRevenue: OrderRevenue,
      totalOrderRevenueCurrentYear: OrderRevenueCurrentYear,
      totalOrderRevenueCurrentMonth: OrderRevenueCurrentMonth,
      totalOrderRevenueToday: OrderRevenueToday,
    };

    res.status(200).json({ status: 200, data: countData });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};

exports.getProductStatusCounts = async (req, res, next) => {
  try {
    // Query to count products by their status
    const statusCounts = await ProductMaster.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Initialize counts object
    const productStatuscounts = {
      active: 0,
      delete: 0,
      deactivate: 0,
    };

    // Assign counts based on the status
    statusCounts.forEach(({ status, count }) => {
      switch (status) {
        case 1:
          productStatuscounts.active = count;
          break;
        case 2:
          productStatuscounts.delete = count;
          break;
        case 0:
          productStatuscounts.deactivate = count;
          break;
        default:
          break;
      }
    });

    // Return the counts
    return res.status(200).json({
      message: "Product status counts fetched successfully",
      status: 200,
      data: productStatuscounts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentWeekSalesData = async (req, res, next) => {
  try {
    const { startOfWeek, endOfWeek } = getCurrentWeekDateRange();

    const salesData = await OrderMaster.findAll({
      attributes: [
        [fn("DATE_TRUNC", "day", col("createdAt")), "day"],
        [fn("SUM", col("amount")), "totalSales"],
      ],
      where: {
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
      group: [fn("DATE_TRUNC", "day", col("createdAt"))],
      order: [[fn("DATE_TRUNC", "day", col("createdAt")), "ASC"]],
      raw: true,
    });

    const dailySales = salesData.map((data) => ({
      day: formatDate(data.day),
      totalSales: parseFloat(data.totalSales),
    }));

    console.log("---", dailySales);
    return res.status(200).json({
      message: "Current Week's Sales Data fetched Successfully",
      status: 200,
      data: dailySales,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
    next(err);
  }
};
