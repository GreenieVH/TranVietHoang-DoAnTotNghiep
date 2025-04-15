const {
    getAllProductVariants,
    getProductVariantById,
    createProductVariant,
    updateProductVariant,
    deleteProductVariant,
    setDefaultVariant
  } = require('../queries/productVariant');
  
  // Get all variants for a product
  exports.getVariantsByProduct = async (req, res) => {
    try {
      const { productId } = req.params;
      const variants = await getAllProductVariants(productId);
      res.json(variants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get single variant by ID
  exports.getVariant = async (req, res) => {
    try {
      const { id } = req.params;
      const variant = await getProductVariantById(id);
      
      if (!variant) {
        return res.status(404).json({ error: 'Product variant not found' });
      }
      
      res.json(variant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Create new variant
  exports.createVariant = async (req, res) => {
    try {
      const variantData = req.body;
      const newVariant = await createProductVariant(variantData);
      res.status(201).json(newVariant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // Update variant
  exports.updateVariant = async (req, res) => {
    try {
      const { id } = req.params;
      const variantData = req.body;
      
      const updatedVariant = await updateProductVariant(id, variantData);
      
      if (!updatedVariant) {
        return res.status(404).json({ error: 'Product variant not found' });
      }
      
      res.json(updatedVariant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // Delete variant
  exports.deleteVariant = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedVariant = await deleteProductVariant(id);
      
      if (!deletedVariant) {
        return res.status(404).json({ error: 'Product variant not found' });
      }
      
      res.json({ message: 'Product variant deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Set default variant
  exports.setDefault = async (req, res) => {
    try {
      const { productId, variantId } = req.params;
      const defaultVariant = await setDefaultVariant(productId, variantId);
      
      if (!defaultVariant) {
        return res.status(404).json({ error: 'Product variant not found' });
      }
      
      res.json(defaultVariant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };