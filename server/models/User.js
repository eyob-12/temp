import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,

	},
	password: {
		type: String,
		required: true,
	},
	favorites: {
		type: Array,
		default: [],
	},
	playlists: {
		type: Array,
		default: [],
	},
});

const User = mongoose.model("User", UserSchema);
export default User;
