import axios from "axios";

export const client = axios.create({
	baseURL: "https://abyssiniasounds.vercel.app/api/",
});
