import { Router } from "express";
import { checkMongoDBConnection } from "../utils/db.js";
import { checkElectricityMapsAPI } from "../utils/api.js";
const route = Router();

/**
 * Simple route to check the health of the server.
 */
route.get("/", async (request, response) => {
    try {
        const healthCheck = {
            uptime: process.uptime(),
            message: "OK",
            timestamp: Date.now(),
            database: await checkMongoDBConnection(),
            externalAPI: await checkElectricityMapsAPI(),
        };
        return response.status(200).send(healthCheck);
    } catch (error) {
        return response.status(500).send("Health check failed!");
    }
});

export default route;
