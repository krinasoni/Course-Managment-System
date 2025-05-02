import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongoose Connected")
    }catch(e){
        console.log("Error occured", e);
    }
}

export default connectDB;