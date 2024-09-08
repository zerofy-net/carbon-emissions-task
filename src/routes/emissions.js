import { Router } from "express";
const route = Router();
import CarbonEmission from "../models/carbonEmissionsSchema.js";
import {
    fetchCarbonIntensity,
    fetchPowerBreakdown,
    calcCarbonEmissions,
} from "../utils/emissions.js";

/**
 * Updates the carbon emissions with the latest data from electricitymaps.com.
 */
route.post("/update", async (request, response) => {
    try {
        const endDate = new Date().toISOString();
        const startDate = new Date(
            new Date() - 24 * 60 * 60 * 1000
        ).toISOString();

        const carbonData = await fetchCarbonIntensity(startDate, endDate);
        const powerData = await fetchPowerBreakdown(startDate, endDate);

        const emissions = calcCarbonEmissions(carbonData, powerData);

        await CarbonEmission.insertMany(emissions);

        return response
            .status(201)
            .send({ message: "Emissions updated successfully!" });
    } catch (error) {
        return response
            .status(500)
            .send({ message: "Error updating emissions" });
    }
});

/**
 * Returns the total carbon emissions for the requested date (YYYY-mm-dd).
 * For example, `curl -i http://localhost:3000/emissions/2024-08-19`.
 */
route.get("/:date", async (request, response) => {
    const date = new Date(request.params.date);
    const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

    try {
        const emissions = await CarbonEmission.find({
            hour: { $gte: startOfDay, $lt: endOfDay },
        }).sort({ hour: 1 });

        if (emissions.length === 0) {
            return response
                .status(404)
                .send({ message: "No data found for this date." });
        }

        const hourlyEmissions = Array(24).fill(null);

        emissions.forEach((h) => {
            const hourIndex = new Date(h.hour).getUTCHours();
            hourlyEmissions[hourIndex] = h.carbonEmissions;
        });

        // calc total
        const totalEmissions = emissions.reduce(
            (total, entry) => total + entry.carbonEmissions,
            0
        );

        return response.status(200).send({
            date: request.params.date,
            totalEmissions,
            hourlyEmissions,
        });
    } catch (error) {
        return response
            .status(500)
            .send({ message: "Error retrieving emissions data." });
    }
});

export default route;
