const OrderMaster = require("../models/orderMaster");
const UserMaster = require("../models/userMaster");
const ProductMaster = require("../models/productMaster");
const CartItems = require("../models/cartItem");
const cartItem = require("../models/cartItem");
const CountryMaster = require("../models/countrymaster");
const StateMaster = require("../models/statemaster");
const CityMaster = require("../models/citymaster");
const AddressMaster = require("../models/addressMaster");
const Sequelize = require("sequelize");
const { generatePDF } = require("../utils/pdfGenerate");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const moment = require("moment");
const Excel = require('exceljs');
const { log } = require("winston");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { generateExcel } = require("../utils/exportData");



exports.postAddOrder = async (req, res, next) => {
  try {
    let { amount, cartID, paymentId, userMasterID, addressMasterID } =
      await req.body;

    let addressDetails = await AddressMaster.findByPk(addressMasterID);

    const {
      emailAddress,
      firstName,
      lastName,
      mobileNo,
      shippingAddress,
      billingAddress,
      countryMasterID,
      stateMasterID,
      cityMasterID,
      zipCode,
    } = addressDetails;

    let addOrderData = await OrderMaster.create({
      amount,
      cartID,
      paymentId,
      userMasterID,
      addressMasterID,
    });

    await CartItems.update(
      { status: 1 },
      { where: { cartItemID: { [Sequelize.Op.in]: cartID } } }
    );

    await sendOrderConfirmationEmail(
      firstName,
      lastName,
      emailAddress,
      addOrderData,
      amount,
      paymentId,
      shippingAddress,
      billingAddress
    );

    res.status(200).json({
      status: 200,
      message: "Order Place Successfully",
      data: addOrderData,
    });

    return addOrderData;
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message, data: {} });

    next(err);
  }
};

async function sendOrderConfirmationEmail(
  firstName,
  lastName,
  emailAddress,
  orderData,    
  amount,
  paymentId,
  shippingAddress,
  billingAddress
) {
  let transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.USEREMAIL,
      pass: process.env.PASS,
    },
  });

  let mailOptions = {
    from: process.env.USEREMAIL,
    to: emailAddress,
    subject: "Order Confirmation",
    html: `<!DOCTYPE html>
    <html>
    <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
    
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
    
    a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }
    
    @media screen and (max-width: 480px) {
        .mobile-hide {
            display: none !important;
        }
        .mobile-center {
            text-align: center !important;
        }
    }
    div[style*="margin: 16px 0;"] { margin: 0 !important; }
    </style>
    <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
    
    
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    </div>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                <tr>
                    <td align="center" valign="top" style="font-size:0; padding-top: 35px; margin-right: 50%;" bgcolor="#fff">
                   
                        <table align="center" border="0" cellpadding="0" cellspacing="0" >
                            <tr>
                                <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 48px;" class="mobile-center">
                                <img src="../uploads/hero_logo.jpg" alt="">
                                </td> 
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                        <tr>
                            <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                                <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                                    Thank You For Your Order!
                                </h2>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                                <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                                        <b>Dear ${firstName} ${lastName} Your order has been confirmed sucessfully<b>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style="padding-top: 20px;">
                                <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                            Order Id 
                                        </td>
                                        <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                         ${orderData.orderMasterID}
                                        </td>
                                    </tr>   
                                </table>
                            </td>
                        </tr>
                        <tr>
                        <td align="left" style="padding-top: 20px;">
                            <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                                        Payment ID
                                    </td>
                                    <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                                    ${paymentId} 
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                        <tr>
                            <td align="left" style="padding-top: 20px;">
                                <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                                            TOTAL
                                        </td>
                                        <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                                        ${amount} 
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    </td>
                </tr>
                 <tr>
                    <td align="center" height="100%" valign="top" width="100%" style="padding: 0 35px 35px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;">
                        <tr>
                            <td align="center" valign="top" style="font-size:0;">
                                <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">
    
                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                                        <tr>
                                            <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
                                                <p style="font-weight: 800;">Delivery Address</p>
                                                <p> ${shippingAddress}</p>
    
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">
                                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                                        <tr>
                                            <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
                                                <p style="font-weight: 800;">Billing Address: </p>
                                                <p>${billingAddress} </p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                <tr>
                  
                </tr>
              
            </table>
            </td>
        </tr>
    </table>
        
    </body>
    </html>
    `,
  };

  // Send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);
}

exports.getOrderDataForAdmin = async (req, res, next) => {
  try {
    const { page, limit, searchQuery, exportData, startDate, endDate } = req.body;

    // Validate date ranges
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }

    if (startDate && new Date(startDate) > new Date()) {
      return res.status(400).json({
        message: "Start date cannot be beyond the current date",
      });
    }

    if (endDate) {
      const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
      if (new Date(endDate) > currentMonthEnd) {
        return res.status(400).json({
          message: "End date cannot be beyond the current month",
        });
      }
    }

    // Build condition for the query
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

    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999); // Ensure full coverage of the end date

      condition.createdAt = {
        [Op.between]: [new Date(startDate), endOfDay],
      };
    }

    // Define the order for sorting results
    const order = [["orderMasterID", "DESC"]];

    // Pagination setup
    const paginationQuery = {};
    if (!exportData) {
      paginationQuery.offset = (page - 1) * limit;
      paginationQuery.limit = limit;
    }

    // Fetch order data
    const orderDataAdmin = await OrderMaster.findAndCountAll({
      raw: true,
      where: condition,
      ...paginationQuery,
      order,
      include: [
        {
          model: UserMaster,
          attributes: ["userName", "emailAddress", "userAddress", "userMobile"],
        },
        {
          model: AddressMaster,
          attributes: [
            "firstName",
            "lastName",
            "emailAddress",
            "mobileNo",
            "shippingAddress",
            "billingAddress",
            "zipCode",
          ],
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
        },
      ],
    });

    let productDetails = [];

    for (const order of orderDataAdmin.rows) {
      const cartItems = await CartItems.findAll({
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
        firstName = order["addressMaster.firstName"],
        lastName = order["addressMaster.lastName"],
        emailAddress = order["addressMaster.emailAddress"],
        mobileNo = order["addressMaster.mobileNo"],
        shippingAddress = order["addressMaster.shippingAddress"],
        billingAddress = order["addressMaster.billingAddress"],
        zipCode = order["addressMaster.zipCode"],
        amount,
        paymentId,
        createdAt,
        updatedAt,
        cityName = order["addressMaster.cityMaster.cityName"],
        stateName = order["addressMaster.stateMaster.stateName"],
        countryName = order["addressMaster.countryMaster.countryName"],
        userMasterID,
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
          userMasterID,
          cityName,
          stateName,
          countryName,
          cartItems,
        },
      };

      productDetails.push(orderWithItems);
    }

    // Export data to Excel if requested
    if (exportData) {
      const dataToExport = orderDataAdmin.rows;
      await generateExcel(dataToExport, "Order", "xlsx", res);
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

  
// exports.getOrderDataForAdmin = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, searchQuery, exportData, startDate, endDate } = req.body;

//     const condition = {};
//     if (searchQuery) {
//       condition[Op.or] = [
//         { firstName: { [Op.iLike]: "%" + searchQuery + "%" } },
//         { lastName: { [Op.iLike]: "%" + searchQuery + "%" } },
//         { emailAddress: { [Op.iLike]: "%" + searchQuery + "%" } },
//         { productName: { [Op.iLike]: "%" + searchQuery + "%" } },
//         { productCode: { [Op.iLike]: "%" + searchQuery + "%" } },
//       ];
//     }

//     if (startDate && endDate) {
//       condition.createdAt = {
//         [Op.between]: [startDate, endDate],
//       };
//     }

//     const order = [["orderMasterID", "DESC"]];

//     const paginationQuery = {};
//     if (!exportData) {
//       paginationQuery.offset = (page - 1) * limit;
//       paginationQuery.limit = limit;
//     }

//     const orderDataAdmin = await OrderMaster.findAndCountAll({
//       raw: true,
//       where: condition,
//       ...paginationQuery,
//       order,
//       include: [
//         {
//           model: UserMaster,
//           attributes: ["userName", "emailAddress", "userAddress", "userMobile"],
//         },
//         {
//           model: AddressMaster,
//           attributes: [
//             "firstName",
//             "lastName",
//             "emailAddress",
//             "mobileNo",
//             "shippingAddress",
//             "billingAddress",
//             "zipCode",
//           ],
//           include: [
//             {
//               model: CountryMaster,
//               attributes: ["countryName"],
//             },
//             {
//               model: StateMaster,
//               attributes: ["stateName"],
//             },
//             {
//               model: CityMaster,
//               attributes: ["cityName"],
//             },
//           ],
//         },
//       ],
//     });

    
//     const transformedData = await Promise.all(orderDataAdmin.rows.map(async (order) => {
    
//       const cartItems = await CartItems.findAll({
//         where: { cartItemID: order.cartID },
//         include: [
//           {
//             model: ProductMaster,
//             attributes: ["productName", "productCode", "price"],
//           },
//         ],
//         attributes: ["quantity"],
//         raw: true, 
//       });

      
//       const cartItemsStructured = cartItems.map(item => ({
//         quantity: item.quantity,
//         productMaster: {
//           productName: item["productMaster.productName"],
//           productCode: item["productMaster.productCode"],
//           price: item["productMaster.price"],
//         }
//       }));

      
//       return {
//         order: {
//           orderMasterID: order.orderMasterID,
//           firstName: order["addressMaster.firstName"],
//           lastName: order["addressMaster.lastName"],
//           emailAddress: order["addressMaster.emailAddress"],
//           shippingAddress: order["addressMaster.shippingAddress"],
//           billingAddress: order["addressMaster.billingAddress"],
//           zipCode: order["addressMaster.zipCode"],
//           amount: order.amount,
//           paymentId: order.paymentId,
//           cartID: order.cartID,
//           createdAt: order.createdAt,
//           updatedAt: order.updatedAt,
//           userMasterID: order.userMasterID,
//           cityName: order["addressMaster.cityMaster.cityName"],
//           stateName: order["addressMaster.stateMaster.stateName"],
//           countryName: order["addressMaster.countryMaster.countryName"],
//           cartItems: cartItemsStructured
//         }
//       };
//     }));

    
//     if (exportData) {
//       const workbook = new Excel.Workbook();
//       const worksheet = workbook.addWorksheet('Order Details');
    
//       const headerStyle = {
//         font: { bold: true },
//         alignment: { horizontal: 'center' },
//       };
    
//       const dataStyle = {
//         alignment: { horizontal: 'left' },
//       };
    
//       worksheet.columns = [
//         { header: 'Order ID', key: 'orderMasterID', width: 12, style: headerStyle },
//         { header: 'First Name', key: 'firstName', width: 15, style: headerStyle },
//         { header: 'Last Name', key: 'lastName', width: 15, style: headerStyle },
//         { header: 'Email Address', key: 'emailAddress', width: 30, style: headerStyle },
//         { header: 'Shipping Address', key: 'shippingAddress', width: 40, style: headerStyle },
//         { header: 'Billing Address', key: 'billingAddress', width: 40, style: headerStyle },
//         { header: 'Zip Code', key: 'zipCode', width: 12, style: headerStyle },
//         { header: 'Amount', key: 'amount', width: 12, style: headerStyle },
//         { header: 'Payment ID', key: 'paymentId', width: 20, style: headerStyle },
//         { header: 'Created At', key: 'createdAt', width: 20, style: headerStyle },
//         { header: 'Updated At', key: 'updatedAt', width: 20, style: headerStyle },
//         { header: 'City', key: 'cityName', width: 20, style: headerStyle },
//         { header: 'State', key: 'stateName', width: 20, style: headerStyle },
//         { header: 'Country', key: 'countryName', width: 20, style: headerStyle },
//       ];
    
//       let rowIndex = 2; // Start adding data rows after headers
    
//       for (const order of orderDataAdmin.rows) {
//         worksheet.addRow({
//           orderMasterID: order.orderMasterID,
//           firstName: order["addressMaster.firstName"],
//           lastName: order["addressMaster.lastName"],
//           emailAddress: order["addressMaster.emailAddress"],
//           shippingAddress: order["addressMaster.shippingAddress"],
//           billingAddress: order["addressMaster.billingAddress"],
//           zipCode: order["addressMaster.zipCode"],
//           amount: order.amount,
//           paymentId: order.paymentId,
//           createdAt: order.createdAt,
//           updatedAt: order.updatedAt,
//           cityName: order["addressMaster.cityMaster.cityName"],
//           stateName: order["addressMaster.stateMaster.stateName"],
//           countryName: order["addressMaster.countryMaster.countryName"],
//         });
    
//         // Fetch cart items for the current order
//         const cartItems = await CartItems.findAll({
//           where: { cartItemID: order.cartID },
//           include: [
//             {
//               model: ProductMaster,
//               attributes: ["productName", "productCode", "price"],
//             },
//           ],
//           attributes: ["quantity"],
//           raw: true,
//         });
    
//         console.log("---", cartItems);
//         if (cartItems.length > 0) {
//           // Add headers for cart items
//           worksheet.addRow(["Cart Item Quantity", "Product Name", "Product Code", "Price"]).eachCell((cell) => {
//             cell.font = { bold: true };
//             cell.alignment = { horizontal: 'center' };
//           });
    
//           // Add cart items data
//           cartItems.forEach(item => {
//             worksheet.addRow({
//               quantity: item.quantity,
//               productName: item["productMaster.productName"],
//               productCode: item["productMaster.productCode"],
//               price: item["productMaster.price"],
//             }).eachCell((cell) => {
//               cell.alignment = { horizontal: 'left' };
//             });
//           });
    
//           rowIndex += cartItems.length + 2; // Increase row index for cart items plus header row
//         } else {
//           rowIndex += 1; // Increase row index if no cart items to avoid overwriting
//         }
//       }
    
//       // Set response headers for Excel file download
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', 'attachment; filename="Order_Details.xlsx"');
    
//       // Write workbook to response and end
//       await workbook.xlsx.write(res);
//       return res.end();
//     }
    

    
//     res.status(200).json({
//       message: 'Order data fetched successfully.',
//       status: 200,
//       data: transformedData,
//       totalCount: orderDataAdmin.count,
//       page,
//       pageSize: limit,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//       status: 500,
//     });
//   }
// };


exports.getProductCountForAdmin = async (req, res, next) => {
  try {
    const { page, limit, searchQuery, exportData } = req.body;

    const condition = {};
    if (searchQuery) {
      condition[Sequelize.Op.or] = [
        { firstName: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
        { lastName: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
        { emailAddress: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
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
    });

    let productCounts = {}; // Object to store product counts

    for (const order of orderDataAdmin.rows) {
      const cartItems = await CartItems.findAll({
        where: { cartItemID: order.cartID },
        include: [
          {
            model: ProductMaster,
            attributes: ["productMasterID"], // Assuming product ID is stored as 'productId'
          },
        ],
        attributes: ["quantity"],
      });

      for (const item of cartItems) {
        const productId = item.productMaster.productId;
        if (productCounts[productId]) {
          productCounts[productId] += item.quantity;
        } else {
          productCounts[productId] = item.quantity;
        }
      }
    }

    return res.status(200).json({
      message: "Product Counts Fetched Successfully",
      status: 200,
      productCounts,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
    next(err);
  }
};

exports.getUserOrderData = async (req, res, next) => {
  const { page, limit, searchQuery, exportData, id } = req.body;

  const condition = {};
  if (searchQuery) {
    condition[Sequelize.Op.or] = [
      { firstName: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
      { lastName: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
      { emailAddress: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
    ];
  }

  condition.userMasterID = id;
  const order = [["orderMasterID", "DESC"]];

  const paginationQuery = {};
  if (!exportData) {
    paginationQuery.offset = (page - 1) * limit;
    paginationQuery.limit = limit;
  }
  // const currentDate = new Date();
  // let startDate;

  // if (filter === 'last3months') {
  //   startDate = new Date(currentDate);
  //   startDate.setMonth(currentDate.getMonth() - 3);
  // } else if (filter === 'last6months') {
  //   startDate = new Date(currentDate);
  //   startDate.setMonth(currentDate.getMonth() - 6);
  // } else if (filter === 'YAREBASIS') {
  //
  // }

  try {
    const userOrder = await OrderMaster.findAndCountAll({
      raw: true,
      where: condition,
      ...paginationQuery,
      include: [
        {
          model: AddressMaster,
          attributes: [
            "firstName",
            "lastName",
            "emailAddress",
            "mobileNo",
            "shippingAddress",
            "billingAddress",
            "zipCode",
          ],
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
        },
      ],
      order,
    });



    let productDetails = [];

    for (const order of userOrder.rows) {
      const cartItems = await CartItems.findAll({
        where: { cartItemID: order.cartID },
        include: [
          {
            model: ProductMaster,
            attributes: ["productMasterID","productName", "productCode", "image", "price"],
          },
        ],
        attributes: ["quantity"],
      });


      const {
        orderMasterID,
        firstName = order["addressMaster.firstName"],
        lastName = order["addressMaster.lastName"],
        emailAddress = order["addressMaster.emailAddress"],
        mobileNo = order["addressMaster.mobileNo"],
        shippingAddress = order["addressMaster.shippingAddress"],
        billingAddress = order["addressMaster.billingAddress"],
        zipCode = order["addressMaster.zipCode"],
        amount,
        paymentId,
        createdAt,
        updatedAt,
        cityName = order["addressMaster.cityMaster.cityName"],
        stateName = order["addressMaster.stateMaster.stateName"],
        countryName = order["addressMaster.countryMaster.countryName"],

        userMasterID,
      } = order;

      const orderWithItems = {
        order: {
          orderMasterID,
          firstName,
          lastName,
          emailAddress,
          mobileNo,
          shippingAddress,
          billingAddress,
          zipCode,
          amount,
          paymentId,
          cartID: order.cartID,
          createdAt,
          updatedAt,
          userMasterID,
          cityName,
          stateName,
          countryName,
          cartItems, // all data from cart
        },
      };

      productDetails.push(orderWithItems);
    }

    res.status(200).json({
      status: 200,
      data: productDetails,
      totalCount: userOrder.count,
      message: "User Order data fetched successfully",
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
    next(err);
  }
};

exports.getOrderDataById = async (req, res, next) => {
  try {
    const { orderMasterID } = req.params;

    // Fetch order details based on orderMasterID
    const orderDetails = await OrderMaster.findOne({
      where: { orderMasterID },
      attributes: [
        "orderMasterID",
        "amount",
        "paymentId",
        "createdAt",
        "updatedAt",
        "userMasterID",
        "addressMasterID",
        "cartID",
      ],
    });

    if (!orderDetails) {
      return res
        .status(200)
        .json({ status: 404, message: "Your Order is Empty" });
    }

    const addressDetails = await AddressMaster.findByPk(
      orderDetails.addressMasterID,
      {
        attributes: [
          "firstName",
          "lastName",
          "emailAddress",
          "mobileNo",
          "shippingAddress",
          "billingAddress",
          "zipCode",
        ],
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
      }
    );

    // Fetch all cart items associated with the order
    const cartItems = await cartItem.findAll({
      where: { cartItemID: orderDetails.cartID },
      include: [
        {
          model: ProductMaster,
          attributes: ["model", "productName", "productCode", "price", "image"],
        },
      ],
      attributes: ["quantity"],
    });

    let today = new Date();
    const options = { day: "2-digit", month: "long", year: "numeric" };
    const invoiceDate = today.toLocaleDateString("en-US", options);

    const dataForPDF = {
      orderMasterID: orderDetails.orderMasterID,
      firstName: addressDetails.firstName,
      lastName: addressDetails.lastName,
      emailAddress: addressDetails.emailAddress,
      mobileNo: addressDetails.mobileNo,
      shippingAddress: addressDetails.shippingAddress,
      billingAddress: addressDetails.billingAddress,
      zipCode: addressDetails.zipCode,
      amount: orderDetails.amount,
      paymentId: orderDetails.paymentId,
      createdAt: orderDetails.createdAt,
      updatedAt: orderDetails.updatedAt,
      userMasterID: orderDetails.userMasterID,
      countryMasterID: orderDetails.countryMasterID,
      stateMasterID: orderDetails.stateMasterID,
      cityMasterID: orderDetails.cityMasterID,
      cityName: addressDetails.cityName,
      stateName: addressDetails.stateName,
      countryName: addressDetails.countryName,
      cartItems: cartItems.map((item) => item.toJSON()),
      invoiceDate,
    };

    res.status(200).json({
      status: 200,
      data: dataForPDF,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
};

exports.generateOrderInvoicePDF = async (req, res, next) => {
  try {
    const { orderMasterID } = req.params;

    // Fetch order details based on orderMasterID
    const orderDetails = await OrderMaster.findOne({
      where: { orderMasterID },
      attributes: [
        "orderMasterID",
        "amount",
        "paymentId",
        "createdAt",
        "updatedAt",
        "userMasterID",
        "addressMasterID",
        "cartID",
      ],
    });

    if (!orderDetails) {
      return res.status(200).json({  status:404 ,message: "Order not found" });
    }

    const addressDetails = await AddressMaster.findByPk(
      orderDetails.addressMasterID,
      {
        attributes: [
          "firstName",
          "lastName",
          "emailAddress",
          "mobileNo",
          "shippingAddress",
          "billingAddress",
          "zipCode",
        ],
      }
    );

    // Fetch all cart items associated with the order
    const cartItems = await cartItem.findAll({
      where: { cartItemID: orderDetails.cartID },
      include: [
        {
          model: ProductMaster,
          attributes: ["productName", "productCode", "price", "image"],
        },
      ],
      attributes: ["quantity"],
    });

    cartItems.forEach((item, index) => {
      item.rowNumber = index + 1;
    });

    const invoiceDate = orderDetails.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Prepare data to be passed to generatePDF function
    const dataForPDF = {
      orderMasterID: orderDetails.orderMasterID,
      firstName: addressDetails.firstName,
      lastName: addressDetails.lastName,
      emailAddress: addressDetails.emailAddress,
      mobileNo: addressDetails.mobileNo,
      shippingAddress: addressDetails.shippingAddress,
      billingAddress: addressDetails.billingAddress,
      zipCode: addressDetails.zipCode,
      amount: orderDetails.amount,
      paymentId: orderDetails.paymentId,
      createdAt: orderDetails.createdAt,
      updatedAt: orderDetails.updatedAt,
      userMasterID: orderDetails.userMasterID,
      cartItems: cartItems,
      invoiceDate,
    };

    const pdfBuffer = await generatePDF("orderdetails", dataForPDF);
    const base64String = pdfBuffer.toString("base64");

    res.status(200).json({
      status: 200,
      data: base64String,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    next(error);
  }
};

exports.getTotalOrderRevenue = async (req, res, next) => {
  try {
    const { filter } = req.query;
    const condition = {};

    // Define date range based on filter
    if (filter === "today") {
      condition.createdAt = {
        [Op.gte]: moment().startOf("day").toDate(),
        [Op.lte]: moment().endOf("day").toDate(),
      };
    } else if (filter === "thisMonth") {
      condition.createdAt = {
        [Op.gte]: moment().startOf("month").toDate(),
        [Op.lte]: moment().endOf("month").toDate(),
      };
    } else if (filter === "thisYear") {
      condition.createdAt = {
        [Op.gte]: moment().startOf("year").toDate(),
        [Op.lte]: moment().endOf("year").toDate(),
      };
    }

    const totalOrderAmount = await OrderMaster.sum("amount", {
      where: condition,
    });

    res.status(200).json({
      message: "Total order amount fetched successfully",
      status: 200,
      totalOrderAmount,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
    next(err);
  }
};

exports.getBestSellingProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, searchQuery, exportData } = req.body;

    const condition = {};
    if (searchQuery) {
      condition[Sequelize.Op.or] = [
        { firstName: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
        { lastName: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
        { emailAddress: { [Sequelize.Op.iLike]: "%" + searchQuery + "%" } },
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
    });

    let productCounts = {};
    let productDetails = {};

    for (const order of orderDataAdmin.rows) {
      const cartIds = Array.isArray(order.cartID)
        ? order.cartID
        : [order.cartID];

      for (const cartId of cartIds) {
        const cartItems = await CartItems.findAll({
          where: { cartItemID: cartId },
          include: [
            {
              model: ProductMaster,
              as: "productMaster",
              attributes: [
                "productMasterID",
                "productName",
                "productCode",
                "description",
                "image",
                "price",
              ],
            },
          ],
          attributes: ["quantity"],
        });

        for (const item of cartItems) {
          const product = item.productMaster;
          if (!product) {
            console.warn(
              `Product not found for cart item with cartID: ${cartId}`
            );
            continue;
          }
          const productId = product.productMasterID;

          if (productCounts[productId]) {
            productCounts[productId] += item.quantity;
          } else {
            productCounts[productId] = item.quantity;
            productDetails[productId] = {
              productName: product.productName,
              productCode: product.productCode,
              description: product.description,
              image: product.image,
              price: product.price,
            };
          }
        }
      }
    }

    const sortedProductCounts = Object.keys(productCounts)
      .map((productId) => ({
        productId,
        count: productCounts[productId],
        ...productDetails[productId],
      }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({
      message: "Most Ordered Products Fetched Successfully",
      status: 200,
      data: sortedProductCounts,
      totalcount: sortedProductCounts.length,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
    next(err);
  }
}
