const db = require("../config/db");
const cartQueries = require("../queries/cart");

module.exports = {
  getCart: async (req, res) => {
    try {
      const { userId } = req;

      // Get or create cart
      let cart = await db.query("SELECT id FROM cart WHERE user_id = $1", [
        userId,
      ]);

      if (cart.rows.length === 0) {
        cart = await db.query(
          "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
          [userId]
        );
      }

      const cartId = cart.rows[0].id;

      // Get cart items
      const result = await db.query(cartQueries.getCartByUser, [userId]);

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          data: { cartId, items: [] },
        });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  addToCart: async (req, res) => {
    try {
      const { userId } = req;
      const { productId, variantId, quantity = 1 } = req.body;

      // Validate product
      const product = await db.query(
        "SELECT base_price, stock FROM products WHERE id = $1 AND is_active = true",
        [productId]
      );

      if (product.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found or inactive",
        });
      }

      let price = product.rows[0].base_price;
      let stock = product.rows[0].stock;

      // Validate variant if provided
      if (variantId) {
        const variant = await db.query(
          "SELECT price, stock FROM product_variants WHERE id = $1",
          [variantId]
        );

        if (variant.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Variant not found",
          });
        }

        price = variant.rows[0].price;
        stock = variant.rows[0].stock;
      }

      // Check stock
      if (stock < quantity) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
        });
      }

      // Get or create cart
      let cart = await db.query("SELECT id FROM cart WHERE user_id = $1", [
        userId,
      ]);

      if (cart.rows.length === 0) {
        cart = await db.query(
          "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
          [userId]
        );
      }

      const cartId = cart.rows[0].id;

      // Add to cart
      const result = await db.query(cartQueries.addToCart, [
        cartId,
        productId,
        variantId || null,
        quantity,
        price,
      ]);

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  updateCartItem: async (req, res) => {
    try {
      const { userId } = req;
      const { itemId } = req.params;
      const { quantity } = req.body;

      // Get cart
      const cart = await db.query("SELECT id FROM cart WHERE user_id = $1", [
        userId,
      ]);

      if (cart.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const cartId = cart.rows[0].id;

      // Get current item to validate stock
      const currentItem = await db.query(
        `SELECT cp.product_id, cp.variant_id, p.stock as "productStock", 
         pv.stock as "variantStock"
         FROM cart_products cp
         LEFT JOIN products p ON cp.product_id = p.id
         LEFT JOIN product_variants pv ON cp.variant_id = pv.id
         WHERE cp.id = $1 AND cp.cart_id = $2`,
        [itemId, cartId]
      );

      if (currentItem.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
      }

      const item = currentItem.rows[0];
      const availableStock = item.variant_id
        ? item.variantStock
        : item.productStock;

      if (availableStock < quantity) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
        });
      }

      // Update quantity
      const result = await db.query(cartQueries.updateCartItem, [
        quantity,
        itemId,
        cartId,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  removeCartItem: async (req, res) => {
    try {
      const { userId } = req;
      const { itemId } = req.params;

      // Get cart
      const cart = await db.query("SELECT id FROM cart WHERE user_id = $1", [
        userId,
      ]);

      if (cart.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const cartId = cart.rows[0].id;

      // Remove item
      const result = await db.query(cartQueries.removeCartItem, [
        itemId,
        cartId,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
      }

      res.json({ success: true, message: "Item removed from cart" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  clearCart: async (req, res) => {
    try {
      const { userId } = req;

      // Get cart
      const cart = await db.query("SELECT id FROM cart WHERE user_id = $1", [
        userId,
      ]);

      if (cart.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      const cartId = cart.rows[0].id;

      // Clear cart
      await db.query(cartQueries.clearCart, [cartId]);

      res.json({ success: true, message: "Cart cleared" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
