import { Router } from "express";
const route = Router();

/**
 * Updates the carbon emissions with the latest data from electricitymaps.com.
 */
route.post("/update", (request, response) => {
    response.send({
        updatedAt: "2024-08-19 16:23",
    });
});

/**
 * Returns the total carbon emissions for the requested date (YYYY-mm-dd).
 * For example, `curl -i http://localhost:3000/emissions/2024-08-19`.
 */
route.get("/:date", (request, response) => {
    response.send({
        date: request.params.date,
    });
});

export default route;
