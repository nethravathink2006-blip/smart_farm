import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
const port=Number(process.env.PORT||5000);
if(process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('MongoDB connected')).catch(error=>console.warn(`MongoDB unavailable; using seeded demo data: ${error.message}`));
app.listen(port,()=>console.log(`RaithaMitra API listening on ${port} (${process.env.DATA_MODE||'DEMO'} mode)`));
