import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, productById, productList, changeStock } from '../controllers/productController.js';

const productRouter = express.Router();

// authSeller runs BEFORE multer, so anonymous visitors can never write files to the server
productRouter.post('/add', authSeller, upload.array('images', 4), addProduct);
productRouter.get('/list', productList)
productRouter.get('/id', productById)
productRouter.post('/stock', authSeller, changeStock)

export default productRouter;
