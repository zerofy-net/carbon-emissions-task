import { Router } from "express";
const route = Router();

/**
 * Simple route to check the health of the server.
 */
route.get("/", (request, response) => {
    const healthCheck = {
        message: "OK",
    };
    response.send(healthCheck);
});

export default route;
