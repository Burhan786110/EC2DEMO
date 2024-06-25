const ReviewForm = require("../models/reviewForm");
const UserMaster = require("../models/userMaster");
const productMaster = require("../models/productMaster");

exports.createReview = async (req, res, next) => {
  const {
    userMasterID,
    productMasterID,
    ratings,
    reviewTitle,
    reviewComments,
  } = req.body;

  // Check if the rating is within the acceptable range
  if (ratings < 1 || ratings > 5) {
    return res
      .status(200)
      .json({ status: 400, message: "Ratings must be between 1 and 5" });
  }

  try {
    // Ensure the user and product exist
    const user = await UserMaster.findByPk(userMasterID);
    const product = await productMaster.findByPk(productMasterID);

    // Create the review
    const newReview = await ReviewForm.create({
      userMasterID,
      productMasterID,
      ratings,
      reviewTitle,
      reviewComments,
    });

    return res.status(200).json({
      status: 200,
      message: "review added sucesfully",
      data: newReview,
    });
  } catch (error) {
    next(error);
  }
};

exports.listReviewsForAdmin = async (req, res, next) => {
  try {
    const { page, limit } = req.body;

    const paginationQuery = {
      offset: (page - 1) * limit,
      limit: limit,
    };

    const condition = {
      status: 0,
    };

    const order = [["reviewFormID", "DESC"]];

    const listReview = await ReviewForm.findAndCountAll({
      where: condition,
      include: [
        { model: UserMaster, attributes: ["userName"] },
        { model: productMaster, attributes: ["productName"] },
      ],
      ...paginationQuery,
      order,
    });

    return res.status(200).json({
      status: 200,
      message: "Reviews fetched successfully",
      data: listReview.rows,
      totalcount: listReview.count,
      page: page,
      pageSize: limit,
    });
  } catch (error) {
    next(error);
  }
};

exports.getReviewByProductID = async (req, res, next) => {
  const { productMasterID } = req.params;
  const { page, limit, exportData, rating } = req.body;

  console.log(req.body);

  const condition = {};

  condition.status = [1];
  condition.productMasterID = productMasterID;
  if (rating) condition.ratings = rating;
  const paginationQuery = {};
  if (!exportData) {
    paginationQuery.offset = (page - 1) * limit;
    paginationQuery.limit = parseInt(limit);
  }

  const order = [["reviewFormID", "DESC"]];

  try {
    const productReview = await ReviewForm.findAndCountAll({
      where: {
        productMasterID: productMasterID,
        ...condition,
      },
      include: [
        {
          model: productMaster,
          attributes: ["productName", "productCode"],
        },
        {
          model: UserMaster,
          attributes: ["userName"],
        },
      ],
      ...paginationQuery,
      order,
    });

    res.status(200).json({
      status: 200,
      message: "Product review fetched successfully",
      data: productReview.rows,
      totalcount: productReview.count,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
    next(error);
  }
};

exports.updateReviewStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // status should be either true (accepted) or false (rejected)

  // Validate the status
  if (typeof status !== "boolean") {
    return res
      .status(200)
      .json({ status: 400, message: "Invalid status value" });
  }

  try {
    // Find the review by its primary key (ID)
    const review = await ReviewForm.findByPk(id);
    if (!review) {
      return res.status(200).json({ status: 404, message: "Review not found" });
    }

    // Update the review status (1 for accepted, 2 for rejected)
    review.status = status ? 1 : 2;
    await review.save();

    // Set the response message based on the updated status
    const responseMessage = status
      ? "Review accepted successfully"
      : "Review rejected successfully";

    // Respond with the updated review and a status message
    return res.status(200).json({
      status: 200,
      message: responseMessage,
      data: review,
    });
  } catch (error) {
    // Pass the error to the next middleware
    next(error);
  }
};

exports.getReviewById = async (req, res, next) => {
  const { reviewFormID } = req.params;
  try {
    const review = await ReviewForm.findByPk(reviewFormID, {
      include: [
        {
          model: productMaster,
          attributes: ["productName", "productCode"],
        },
        {
          model: UserMaster,
          attributes: ["userName"],
        },
      ],
    });

    res.status(200).json({
      status: 200,
      message: "review fetched successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
    next(error);
  }
};

exports.getReviewPercentageByProductID = async (req, res, next) => {
  const { productMasterID } = req.params;

  try {
    const reviews = await ReviewForm.findAll({
      where: {
        productMasterID: productMasterID,
        status: 1,
      },
      include: [
        {
          model: UserMaster,
          attributes: ["userName"],
        },
        {
          model: productMaster,
          attributes: ["productName"],
        },
      ],
    });

    if (reviews.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No reviews found for the given product ID",
        data: [],
        totalcount: 0,
        ratingPercentage: {},
        averageRating: null,
      });
    }

    const totalReviews = reviews.length;
    const ratingCounts = [0, 0, 0, 0, 0];
    let sumOfRatings = 0;

    reviews.forEach((review) => {
      ratingCounts[review.ratings - 1]++;
      sumOfRatings += review.ratings;
    });

    const ratingPercentage = {
      very_bad: ratingCounts[0],
      bad: ratingCounts[1],
      average: ratingCounts[2],
      good: ratingCounts[3],
      excellent: ratingCounts[4],
    };

    const averageRating = (sumOfRatings / totalReviews).toFixed(2);

    res.status(200).json({
      status: 200,
      message:
        "Product Review Percentage and Average Rating fetched successfully",
      ratingPercentage: ratingPercentage,
      averageRating: parseFloat(averageRating),
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
    next(error);
  }
};
