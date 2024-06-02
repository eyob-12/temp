import axios from "axios";

const baseURL = "https://abyssiniasounds.vercel.app/api/";

export const client = axios.create({
	baseURL,
});