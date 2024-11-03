import express from 'express';
import bodyParser from 'body-parser';
import imageRoutes from './routes/imageRoutes'

const app = express();
const port = 3000;


app.use(bodyParser.json());//using this middleware to parse incoming json requrests

app.use('/api/images', imageRoutes);// to use this route when having a request starting with /api/images

app.post('/api/upload;')

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

