const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const Newsletter = require("../models/newsletter");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const { generateExcel } = require("../utils/exportData");



exports.addNewsletter = async (req, res, next) => {
  try {
    const { emailAddress } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return res.status(200).json({ status: 400, message: "Enter valid email address" });
    }

    const newNewsletter = await Newsletter.create({ emailAddress });

    let transporter = nodemailer.createTransport({
      service: "gmail", // you can use other service providers
      auth: {
        user: "mailto:ghadiyaliburhan7@gmail.com", // your email
        pass: "uoon fwkl gxdu jqky", // your email password
      },
    });

    let htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Subscription Confirmation</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    background-color: #f7f7f7;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    
                    padding: 20px;
                    color: #000000;
                    text-align: center;
                }
                .header img {
                    max-width: 100px;
                    margin-bottom: 10px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .content h2 {
                    color: #333;
                    font-size: 20px;
                }
                .content p {
                    margin-bottom: 15px;
                    font-size: 16px;
                    color: #555;
                }
                .cta-button {
                    display: block;
                    width: 200px;
                    margin: 20px auto;
                    padding: 10px;
                    text-align: center;
                    background-color: #007BFF;
                    color: #fff;
                    border-radius: 5px;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 16px;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                }
                .footer p {
                    margin: 0;
                    line-height: 1.5;
                }
                .footer a {
                    color: #007BFF;
                    text-decoration: none;
                }
                .social-icons {
                    margin-top: 20px;
                    text-align: center;
                }
                .social-icons img {
                    width: 40px;
                    margin: 0 10px;
                }
                @media (max-width: 600px) {
                    .container {
                        padding: 10px;
                    }
                    .header h1 {
                        font-size: 20px;
                    }
                    .content h2 {
                        font-size: 18px;
                    }
                    .content p {
                        font-size: 14px;
                    }
                    .cta-button {
                        width: 100%;
                        font-size: 14px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://mehtaindia.com/wp-content/uploads/2022/04/Mehta-Logo-PNG-136-x-60.png" alt="Company Logo">
                    <h1>Mehta India</h1>
                </div>  
                <div class="content">
                    <h2>Hello ${emailAddress},</h2>
                    <p>Thank you for subscribing to Mehta India!</p>
                    <p>We're excited to have you on board. You'll be the first to know about our latest updates and exclusive offers.</p>
                    <a href="https://www.mehtaindia.com" class="cta-button">Visit Our Website</a>
                </div>
                <div class="footer">
                    <p>Mehta Hitech Industries Limited</p>
                    <p>Plot No.3, Road No.1, Kathwada GIDC, Kathwada, SP Ring Road, Ahmedabad-382430, Gujarat, India.</p>
                    <p><a href="mailto:care@mehtaindia.com">care@mehtaindia.com</a> | +91-92279 85781</p>
                    <p>We support & promote e-waste management.</p>
                    <div class="social-icons">
                        <a href="https://www.facebook.com/MehtaHitechIndustriesLimited" target="_blank">
                            <img src="https://th.bing.com/th?id=ODLS.a18af44b-d95f-4dbd-bac3-8faad6158af7&w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2" alt="Facebook">
                        </a>
                        <a href="https://www.twitter.com/MehtaHitech" target="_blank">  
                            <img src="https://th.bing.com/th?id=ODLS.8f58e585-9071-490b-af9f-8ffde959d166&w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2" alt="Twitter">
                        </a>
                        <a href="https://www.linkedin.com/company/13228737/admin/feed/posts/" target="_blank">
                            <img src="https://th.bing.com/th?id=ODLS.fc619bab-a786-4b75-8669-6881202d98da&w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2" alt="LinkedIn">
                        </a>
                        <a href="https://www.instagram.com/mehta_hitech/" target="_blank">
                            <img src="https://th.bing.com/th?id=ODLS.bc2285e6-18ab-4eac-80d8-28a552192970&w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2" alt="Instagram">
                        </a>
                        <a href="https://www.youtube.com/channel/UCmUnjAtUPXSsbcNwBjal8wQ" target="_blank">
                            <img src="https://th.bing.com/th?id=ODLS.3aa29588-8c54-4ccb-995d-88df115a25ad&w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2" alt="Youtube">
                        </a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

    let mailOptions = {
      from: "mailto:ghadiyaliburhan7@gmail.com", // sender address
      to: emailAddress, // list of receivers
      subject: "Subscription Confirmation", // Subject line
      html: htmlTemplate, // HTML body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email: ", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({
      status: 200,
      message: "Your Response has been submitted successfully",
      data: newNewsletter,
    });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
    next(error);
  }
};

exports.getAllNewsLetterData = async (req, res, next) => {
  try {
    const { page, limit, searchQuery, exportData } = req.body;

    const condition = {};
    if (searchQuery) {
      condition[Op.or] = [
        { emailAddress: { [Op.iLike]: "%" + searchQuery + "%" } },
      ];
    }

    const order = [["newsletterSubscriberID", "DESC"]];

    const paginationQuery = {};
    if (!exportData) {
      paginationQuery.offset = (page - 1) * limit;
      paginationQuery.limit = limit;
    }

    const newsLetterData = await Newsletter.findAndCountAll({
      raw: true,
      where: condition,
      ...paginationQuery,
      order,
    });



    if (exportData) {
      const finaldata = [];

      for (let i = 0; i < newsLetterData.rows.length; i++) {
        const rowData = newsLetterData.rows[i]; // Fetch the row directly

        const object = {
          newsletterSubscriberID: rowData.newsletterSubscriberID,
          SubscriberEmailAddress: rowData.emailAddress,
          SubscribeDateTime: rowData.createdAt,
        };
        finaldata.push(object);
      }
      await generateExcel(finaldata, "NewsNews Letter Subscriber Details", "xlsx", res);
      return;
    }

    return res.status(200).json({
      message: "Newsletter Data fetched Successfully",
      status: 200,
      data: newsLetterData.rows,
      totalcount: newsLetterData.count,
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
