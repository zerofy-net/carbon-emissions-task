import axiosInstance from "../configs/axios.js";

export async function checkElectricityMapsAPI() {
    try {
        const response = await axiosInstance.get("/health");
        if (response.status === 200) {
            return "Electricity Maps API is accessible";
        }
    } catch (error) {
        return "Electricity Maps API failed";
    }
}
