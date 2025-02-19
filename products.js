const fs = require('fs').promises;
const path = require('path');
const cuid = require('cuid');
const db = require('./db');

const productsFile = path.join(__dirname, 'data/full-products.json');

const Product = db.model('Product', {
  _id: { type: String, default: cuid },
  description: { type: String },
  alt_description: { type: String },
  likes: { type: Number, required: true },
  urls: {
    regular: { type: String, required: true },
    small: { type: String, required: true },
    thumb: { type: String, required: true },
  },
  links: {
    self: { type: String, required: true },
    html: { type: String, required: true },
  },
  user: {
    id: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String },
    portfolio_url: { type: String },
    username: { type: String, required: true },
  },
  tags: [{
    title: { type: String, required: true },
  }],
});

/**
 * List products
 * @param {*} options 
 * @returns {Promise<Array>}
 */
async function list(options = {}) {
  const { offset = 0, limit = 25, tag } = options;

  const data = await fs.readFile(productsFile);
  const products = JSON.parse(data);

  // Filter products by tag if provided
  const filteredProducts = tag
    ? products.filter(product => product.tags.some(({ title }) => title === tag))
    : products;

  return filteredProducts.slice(offset, offset + limit);
}

/**
 * Get a single product
 * @param {string} id
 * @returns {Promise<object>}
 */
async function get(id) {
  return await Product.findById(id);
}

/**
 * Create a product
 * @param {object} fields
 * @returns {Promise<object>}
 */
async function create(fields) {
  const product = new Product(fields);
  await product.save();
  return product;
}

/**
 * Edit a product
 * @param {string} _id
 * @param {object} change
 * @returns {Promise<object|null>}
 */
async function edit(_id, change) {
  const product = await get(_id);
  if (!product) return null;

  Object.assign(product, change);
  await product.save();
  return product;
}

/**
 * Delete a product
 * @param {string} _id
 * @returns {Promise<object>}
 */
async function destroy(_id) {
  return await Product.deleteOne({ _id });
}

module.exports = {
  list,
  get,
  create,
  edit,
  destroy
};
