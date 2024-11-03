import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';
export interface RequestCustom extends Request
{
    property: string;
}
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const uploadImage = async (req: Request, res: Response) => {
  try {
    // Define the path to counter.json
    const counterPath = path.join(__dirname, '../../counter.json');
    
    
    const counterData = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
    let currentCount = counterData.count; 
    
    const filename = `${currentCount}.jpg`; // starting with "1.jpg"
    const uploadPath = `uploads/${filename}`;
    if (req.file) {
      
      fs.renameSync(req.file.path, uploadPath);
    }
    
    currentCount += 1;
    fs.writeFileSync(counterPath, JSON.stringify({ count: currentCount }));
    res.send(`Image uploaded successfully as ${filename}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Image upload failed.');
  }
};


const resizeImage = async(req: Request, res: Response) => {
    const {width, height, filename} =req.body;//we get the needed info from request body
    
    if(!width || !height || !filename){
        res.status(400).send('Width, height, filename are required.');
    }
    const filePath = path.join(__dirname, '../../uploads', filename);
    try{
        const outputFilePath = path.join(__dirname, '../../images/resized', `resized-${Date.now()}-${filename}`);
        await sharp(filePath).resize(parseInt(width), parseInt(height), {
            fit:'inside'
        }).toFile(outputFilePath);

        res.send(`Image resized successfully! Resized file:${outputFilePath}`);
        return;
    }catch(error){
        console.error(error);
        res.status(500).send('Image resizing failed.');

    }

    
};




const cropImage = async (req: Request, res: Response) => {
    const {x,y,width,height,filename}=req.body;//get crop area
    
    if( !x || !y || !width || !height || !filename){
        res.status(400).send("x, y, width, height, and filename are required")
    }

    const filePath = path.join(__dirname, '../../uploads', filename);
    const outputFilePath = path.join(__dirname, '../../images/cropped', `cropped-${Date.now()}-${filename}`);

    try{
        await sharp(filePath).extract({
            left: parseInt(x),
            top: parseInt(y),
            width: parseInt(width),
            height:parseInt(height)
        }).toFile(outputFilePath);
        res.send(`Image cropped successfully! Cropped file: ${outputFilePath}`);
        return;

    }catch(error){
        console.error(error);
        res.status(500).send("Image cropping failed.");
    }
};

const downloadImage = (req: Request, res: Response) => {
    res.send('Image download initiated!');
}; 

const applyGrayscale = async (req: Request, res: Response) => {
  const { filename } = req.body;

  if (!filename) {
    res.status(400).send('Filename is required.');
    return;
  }

  const filePath = path.join(__dirname, '../../uploads', filename);
  const outputFilePath = path.join(__dirname, '../../images/grayscale', `grayscale-${Date.now()}-${filename}`);

  try {
    await sharp(filePath)
      .grayscale()
      .toFile(outputFilePath);

    res.send(`Image converted to grayscale! Grayscale file: ${outputFilePath}`);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send('Grayscale conversion failed.');
  }
};

const applyBlurr = async (req:Request, res:Response) =>{
    const{filename, blurlevel}=req.body;

    if(!filename || !blurlevel){
        res.status(400).send("Filename is required");
        return;
    }

    const filePath = path.join(__dirname, '../../uploads', filename)
    const outputFilePath = path.join(__dirname, '../../images/blurred', `blurred-${Date.now()}-${filename}`);

    try{
        await sharp(filePath)
        .blur(parseFloat(blurlevel))
        .toFile(outputFilePath);

        res.send(`Image blurred successfully! Blurred file:${outputFilePath}`);
        return;
    }catch(error){
        console.error(error);
        res.status(500).send('Image blurring failed.');
    }
};

const applyWatermark = async (req: Request, res: Response) => {
    const { filename } = req.body; // Get the filename of the uploaded image

    if (!filename) {
        res.status(400).send('Filename is required.');
        return;
    }

    
    const filePath = path.join(__dirname, '../../uploads', filename);
    const watermarkPath = path.join(__dirname, '../../watermark', 'watermark.png');
    const outputFilePath = path.join(__dirname, '../../images/watermarked', `watermarked-${Date.now()}-${filename}`);

    try {
        
        const imageMetadata = await sharp(filePath).metadata();
        const tileSize=400;

        
        const canvas = createCanvas(tileSize, tileSize);
        const context = canvas.getContext('2d');
        //context.font = '20px Arial'; // Adjust font size and style as needed
        //context.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Set watermark text color and opacity

        

        
        const watermarkPattern = await loadImage(watermarkPath);

       
        for (let y = 0; y < canvas.height; y += watermarkPattern.height) {
            for (let x = 0; x < canvas.width; x += watermarkPattern.width) {
                context.drawImage(watermarkPattern, x, y);
            }
        }

        
        const watermarkBuffer = canvas.toBuffer('image/png');
       
         await sharp(filePath)
            .composite([{ 
                input: watermarkBuffer, 
                tile: true,
                blend: 'overlay' 
            }])
            .toFile(outputFilePath);

        res.send(`Watermark applied successfully! Watermarked file: ${outputFilePath}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Applying watermark failed.');
    }
};


// Export all functions at once
export default {
    uploadImage,
    resizeImage,
    cropImage,
    downloadImage,
    applyGrayscale,
    applyBlurr,
    applyWatermark,
};
