import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './database/db.js';
import UserRoute from './routes/user.route.js'
import CourseRoute from './routes/course.route.js'
import mediaRoute from './routes/media.route.js'
import purchaseRoute from './routes/purchaseCourse.route.js'
import courseProgressRoute from './routes/courseProgress.route.js'

dotenv.config();

connectDB()
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
//apis
app.use("/api/v1/media", mediaRoute)
app.use("/api/v1/user", UserRoute)
app.use("/api/v1/course", CourseRoute)
app.use("/api/v1/purchase", purchaseRoute)
app.use("/api/v1/progress", courseProgressRoute)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server listen at PORT ${PORT}`)
})