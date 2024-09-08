import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://api.electricitymap.org/",
    headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
});

export default axiosInstance;
