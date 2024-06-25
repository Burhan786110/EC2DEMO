const sequelize = require("../config/database");
const CartItem = require("../models/cartItem");
const ProductMaster = require("../models/productMaster");
const ProductCategory = require("../models/productCategory");
const ParentSubCategory = require("../models/parentSubCategory");
const OrderMaster = require("../models/orderMaster");
const UserMaster = require("../models/userMaster");
const CountryMaster = require("../models/countrymaster");
const StateMaster = require("../models/statemaster");
const CityMaster = require("../models/citymaster");
const { generatePDF } = require("../utils/pdfGenerate");
const { generateExcel } = require("../utils/exportData");
const { Op, Sequelize } = require("sequelize");
const exceljs = require("exceljs");
const fs = require("fs");
const Contact = require("../models/contactForm");
const { log } = require("console");

// yearly , monthly, daily report of product sales
exports.productSellingReport = async (req, res, next) => {
  try {
    const { exportData, reportType, startDate, endDate } = req.body;

    let condition = {};
    let group = [
      "cartItem.productMasterID",
      "productMaster.productName",
      "productMaster.productCode",
      "productMaster.price",
    ];

    // Set condition and group for different report types
    if (reportType === "monthly") {
      condition = sequelize.literal(
        `EXTRACT(MONTH FROM "cartItem"."createdAt") = EXTRACT(MONTH FROM '${startDate}'::timestamp)`
      );
      group.push(
        sequelize.literal(`EXTRACT(MONTH FROM "cartItem"."createdAt")`)
      );
    } else if (reportType === "yearly") {
      condition = sequelize.literal(
        `EXTRACT(YEAR FROM "cartItem"."createdAt") = EXTRACT(YEAR FROM '${startDate}'::timestamp)`
      );
      group.push(
        sequelize.literal(`EXTRACT(YEAR FROM "cartItem"."createdAt")`)
      );
    } else if (reportType === "daily") {
      condition = {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("DATE", sequelize.col("cartItem.createdAt")),
            ">=",
            startDate
          ),
          sequelize.where(
            sequelize.fn("DATE", sequelize.col("cartItem.createdAt")),
            "<=",
            endDate
          ),
        ],
      };
      group.push(sequelize.literal(`DATE("cartItem"."createdAt")`));
    }

    const topProducts = await CartItem.findAll({
      attributes: [
        [sequelize.col("cartItem.productMasterID"), "productMasterID"],
        [
          sequelize.fn("COUNT", sequelize.col("cartItem.productMasterID")),
          "productCount",
        ],
      ],
      group,
      where: condition,
      order: [[sequelize.literal('"productCount"'), "DESC"]],
      limit: 10,
      include: [
        {
          model: ProductMaster,
          attributes: ["productName", "productCode", "price"], // Include productName and productCode
        },
      ],
      raw: true,
      nest: true,
    });

    // Export to Excel if requested
    if (exportData === "excel") {
      const dataToExport = topProducts.map((product) => ({
        "Product Name": product.productMaster.productName,
        "Product Code": product.productMaster.productCode,
        "Product Price": product.productMaster.price,
        "Total Selling Quantity": product.productCount,
      }));
      await generateExcel(
        dataToExport,
        `TopOrderedProducts_${reportType}_${startDate}_${endDate}`,
        "xlsx",
        res
      );
      return;
    }

    // Return the top products if no export is requested
    res.status(200).json({
      status: 200,
      data: topProducts,
      message: "Top ordered products fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message || "Failed to fetch top ordered products",
    });
    next(err);
  }
};

exports.getOrderDetailReport = async (req, res, next) => {
  try {
    const { page, limit, searchQuery, exportData } = req.body;

    const condition = {};
    if (searchQuery) {
      condition[Op.or] = [
        { firstName: { [Op.iLike]: "%" + searchQuery + "%" } },
        { lastName: { [Op.iLike]: "%" + searchQuery + "%" } },
        { emailAddress: { [Op.iLike]: "%" + searchQuery + "%" } },
        { productName: { [Op.iLike]: "%" + searchQuery + "%" } },
        { productCode: { [Op.iLike]: "%" + searchQuery + "%" } },
      ];
    }

    const order = [["orderMasterID", "DESC"]];

    const paginationQuery = {};
    if (!exportData) {
      paginationQuery.offset = (page - 1) * limit;
      paginationQuery.limit = limit;
    }

    const orderDataAdmin = await OrderMaster.findAndCountAll({
      raw: true,
      where: condition,
      ...paginationQuery,
      order,
      include: [
        {
          model: UserMaster,
          attributes: ["userName"],
        },
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

    let productDetails = [];

    for (const order of orderDataAdmin.rows) {
      const cartItems = await CartItem.findAll({
        where: { cartItemID: order.cartID },
        include: [
          {
            model: ProductMaster,
            attributes: ["productName", "productCode", "price"],
          },
        ],
        attributes: ["quantity"],
      });

      const {
        orderMasterID,
        firstName,
        lastName,
        emailAddress,
        shippingAddress,
        billingAddress,
        zipCode,
        amount,

        paymentId,
        createdAt,
        updatedAt,
        userMasterID,
        countryMasterID,
        stateMasterID,
        cityMasterID,
      } = order;

      const orderWithItems = {
        order: {
          orderMasterID,
          firstName,
          lastName,
          emailAddress,
          shippingAddress,
          billingAddress,
          zipCode,
          amount,

          paymentId,
          cartID: order.cartID,
          createdAt,
          updatedAt,
          // userMasterID: order['UserMaster.userName'],
          // countryMasterID: order['CountryMaster.countryName'],
          // stateMasterID: order['StateMaster.stateName'],
          // cityMasterID: order['CityMaster.cityName'],
          userMasterID,
          countryMasterID,
          stateMasterID,
          cityMasterID,
          cartItems,
        },
      };

      productDetails.push(orderWithItems);
    }

    // Export data to Excel if exportData is 'excel'
    if (exportData === "excel") {
      const dataToExport = orderDataAdmin.rows;
      await generateExcel(dataToExport, "Order", "xlsx", res);
      return;
    }

    // Export data to PDF if exportData is 'pdf'
    if (exportData === "pdf") {
      const dataToExport = orderDataAdmin.rows;
      await generatePDF(dataToExport, "order", "pdf", res);
      return;
    }

    return res.status(200).json({
      message: "Order Data fetched Successfully",
      status: 200,
      data: productDetails,
      totalcount: orderDataAdmin.count,
      page: +page,
      pageSize: paginationQuery.limit,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
    next(err);
  }
};

exports.getAllAdminCount = async (req, res, next) => {
  try {
    const parentSubCategoryCount = await ParentSubCategory.count();

    const categoryCount = await ProductCategory.count();

    const productCount = await ProductMaster.count();

    const orderCount = await OrderMaster.count();

    const reservedCartCount = await CartItem.findAndCountAll({
      where: { status: 0 },
    });

    const userCount = await UserMaster.count();

    const contactCount = await Contact.count();

    const countData = {
      parentSubCategory: parentSubCategoryCount,
      productCategory: categoryCount,
      productMaster: productCount,
      orderMaster: orderCount,
      cart: reservedCartCount.count,
      userMaster: userCount,
      contactQuery: contactCount,
    };

    res.status(200).json({ status: 200, data: countData });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};


exports.getTotalSalesByMonthYear = async (req, res, next) => {
  try {
    const { month, year, exportData } = req.body;

    console.log(req.body);

    console.log(year);


    if (!month || !year) {
      // console.log(month, year);
      return res.status(400).json({
        status: 400,
        message: 'Month and year are required',
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1); 

    
    const condition = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      }
    };

    
    const salesData = await OrderMaster.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'dayDate'],
        [sequelize.fn('sum', sequelize.col('amount')), 'totalSales'],
      ],
      where: condition,
      group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
      raw: true,
    });

    if (exportData) {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet("Daily Sales");

      worksheet.columns = [
        { header: 'Date', key: 'dayDate', width: 20 },
        { header: 'Total Sales', key: 'totalSales', width: 15 }
      ];

     
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6495ED' } 
      };

      
      if (Array.isArray(salesData)) {
        salesData.forEach((item) => {
          worksheet.addRow({
            dayDate: new Date(item.dayDate).toLocaleDateString('en-US'),
            totalSales: item.totalSales,
          });
        });
      } else {
        throw new Error("Sales data is not in expected format");
      }

     
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White font color
        cell.alignment = { horizontal: 'center' };
      });

      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="daily_sales.xlsx"');

     
      await workbook.xlsx.write(res);
      return res.end();
    }

    return res.status(200).json({
      status: 200,
      message: "Daily sales data fetched successfully",
      data: salesData,
    });

  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
    next(err);
  }
};