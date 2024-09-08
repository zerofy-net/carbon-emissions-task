import axiosInstance from "../configs/axios.js";

export const fetchCarbonIntensity = async (
    startDate,
    endDate,
    myZone = "EE"
) => {
    const response = await axiosInstance.get("/v3/carbon-intensity/history", {
        params: {
            zone: myZone,
            start: startDate,
            end: endDate,
        },
    });
    return response.data;
};

export const fetchPowerBreakdown = async (
    startDate,
    endDate,
    myZone = "EE"
) => {
    const response = await axiosInstance.get("/v3/power-breakdown/history", {
        params: {
            zone: myZone,
            start: startDate,
            end: endDate,
        },
    });
    return response.data;
};

export const calcCarbonEmissions = (carbonData, powerData) => {
    // carbon data - time & intensity
    const carbonMap = new Map(
        carbonData.history.map(({ datetime, carbonIntensity }) => [
            datetime,
            carbonIntensity, // in gCO2eq/kWh
        ])
    );

    // calc emissions based on power data
    const emissions = powerData.history.map(
        // time & powerconsumption (in MW)
        ({ datetime, powerConsumptionTotal }) => {
            const carbonIntensity = carbonMap.get(datetime);
            const powerConsumptionKWh = powerConsumptionTotal * 1000; // from MW to kWh

            return {
                hour: datetime,
                carbonEmissions:
                    carbonIntensity !== undefined
                        ? carbonIntensity * powerConsumptionKWh // in gCO2eq
                        : null,
                carbonIntensity: carbonIntensity ?? null,
                powerConsumption: powerConsumptionKWh,
            };
        }
    );

    return emissions;
};
