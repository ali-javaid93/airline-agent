import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes'; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// Test route
app.get('/', (req, res) => {
  res.send('API is working!');
});

// Mount API routes under /api
app.use('/api', router);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
