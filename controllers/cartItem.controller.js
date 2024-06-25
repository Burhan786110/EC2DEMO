const cartItem = require("../models/cartItem");
const productMaster = require("../models/productMaster");
const Sequelize = require("sequelize");
const { Op } = Sequelize;

exports.addToCart = async (req, res) => {
  try {
    const { userMasterID, itemsToAdd } = req.body;

    if (!userMasterID) {  
      return res.status(200).json({
        status: 401,
        message: "Please log in to add items to the cart",
      });
    }

    for (const item of itemsToAdd) {
      const { productMasterID, quantity } = item;
      if (quantity == null || quantity <= 0) {
        return res.status(400).json({
          status: 400,
          message: "Please select a valid quantity",
        });
      }

      if (quantity > 5) {
        return res.status(400).json({
          status: 400,
          message: "More than 5 quantity cannot be added",
        });
      }

      let existingCartItem = await cartItem.findOne({
        where: { productMasterID, userMasterID, status: 0 },
      });

      if (!existingCartItem) {
        await cartItem.create({ userMasterID, productMasterID, quantity });
      } else {
        existingCartItem.quantity += parseInt(quantity);
        if (existingCartItem.quantity <= 0) {
          await existingCartItem.destroy();
          return res
            .status(200)
            .json({ status: 200, message: "Cart item removed successfully" });
        } else {
          await existingCartItem.save();
        }
      }
    }

    res.status(200).json({
      status: 200,
      message: "Items added to cart successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

exports.getCartItems = async (req, res, next) => {
  try {
    const { userMasterID } = req.params;

    const condition = {
      status: 0,
      deletedAt: {
        [Op.is]: null,
      },
      userMasterID: userMasterID,
    };

    const order = [["cartItemID", "DESC"]];

    // Fetch cart items for the specified userMasterID
    const cartItems = await cartItem.findAll({
      where: condition,
      order,
      include: [
        {
          model: productMaster,
          attributes: ["productMasterID", "productName", "price", "image"],
        },
      ],
    });

    // Calculate subtotal
    let subtotal = 0;
    cartItems.forEach((item) => {
      if (item.productMaster) {
        subtotal += item.quantity * item.productMaster.price;
        item.dataValues.subtotal = item.quantity * item.productMaster.price;
      }
    });

    let totalCount = cartItems.length;

    res.status(200).json({
      status: 200,
      data: cartItems,
      Total: subtotal,
      totalCount: totalCount,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
    });
    next(error);
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { cartItemID, plus, minus } = req.body;

    // Validate inputs
    if (cartItemID == null || (plus == null && minus == null)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid input parameters",
      });
    }

    // Calculate the change in quantity
    let change = 0;
    if (plus != null) {
      change += plus;
    }
    if (minus != null) {
      change -= minus;
    }

    // Find the cart item
    let existingCartItem = await cartItem.findOne({
      where: { cartItemID },
      include: [
        {
          model: productMaster,
          attributes: ["productMasterID", "price"],
        },
      ],
    });

    // Update the quantity
    let newQuantity = existingCartItem.quantity + change;

    // Validate the new quantity
    if (newQuantity === 0) {
      await existingCartItem.destroy();
      return res.status(200).json({
        status: 200,
        message: "Cart item removed successfully",
      });
    }

    // Save the updated quantity
    existingCartItem.quantity = newQuantity;
    await existingCartItem.save();

    const updatedAmount = newQuantity * existingCartItem.productMaster.price;

    res.status(200).json({
      status: 200,
      message: "Cart item quantity updated successfully",
      updatedAmount: updatedAmount,
      newQuantity: newQuantity,
    });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { cartItemID } = req.params;

    const result = await cartItem.destroy({
      where: {
        cartItemID: cartItemID,
      },
    });

    res.status(200).json({
      status: 200,
      message: "Product removed from the cart successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
    next(error);
  }
};


exports.mergeCart = async (req, res) => {
  try {
    const { userMasterID } = req.body;
    const itemsToAdd = req.body.cart;

    if (!userMasterID) {
      return res.status(400).json({ status: 400, message: "User ID is required" });
    }

    for (const item of itemsToAdd) {
      const { productMasterID, quantity } = item;
      if (quantity <= 0) continue; // Skip invalid quantities

      let existingCartItem = await cartItem.findOne({
        where: { productMasterID, userMasterID, status: 0 },
      });

      if (!existingCartItem) {
        await cartItem.create({ userMasterID, productMasterID, quantity });
      } else {
        existingCartItem.quantity += parseInt(quantity);
        await existingCartItem.save();
      }
    }

    res.status(200).json({ status: 200, message: "Cart merged successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};