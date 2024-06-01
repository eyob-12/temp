import mongoose from "mongoose";

console.log("MONGO_CONNECTION_STRING:", process.env.MONGO_CONNECTION_STRING);

export const connectDb = async () => {
	try {
		const connect = await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
		console.log("DATABASE CONNECTED", connect.connection.name);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
