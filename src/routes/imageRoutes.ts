import { Router } from 'express';
import imageController from '../controllers/imageController';
import upload from '../middlewares/multerConfig';

const router = Router();
router.post('/upload', upload.single('image'), imageController.uploadImage);

router.post('/resize', imageController.resizeImage);
router.post('/crop', imageController.cropImage);
router.get('/download', imageController.downloadImage);
router.post('/grayscale', imageController.applyGrayscale);
router.post('/blur', imageController.applyBlurr);
router.post('/watermark', imageController.applyWatermark);


export default router;