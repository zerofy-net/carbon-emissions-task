const axios = require("axios");
const logger = require('../../logs/logger');
const { megawattsToWatts, carbonIntensityGPerKWhToGPerWh } = require('../../utils/conversions');

function calculateCarbonEmissions(consumption, intensity) {
	if(!Array.isArray(consumption) || !Array.isArray(intensity)){
		throw new Error('Invalid input: Consumption and carbon intensity data should be arrays')
	};
	const intensityMap = intensity.reduce((acc, curr) => {
		acc[curr.datetime] = curr.carbonIntensity;
		return acc;
	}, {});

	const emissions = consumption.map(consumptionEntry => {
		const carbonIntensity = intensityMap[consumptionEntry.datetime];

		if(carbonIntensity !== undefined){
			const powerConsumptionInW = megawattsToWatts(consumptionEntry.powerConsumptionTotal);
        		const carbonIntensityInWh = carbonIntensityGPerKWhToGPerWh(carbonIntensity);

			const carbonEmissionsInGrams = powerConsumptionInW * carbonIntensityInWh;

			return {
				datetime: consumptionEntry.datetime,
				carbonEmission: carbonEmissionsInGrams
			};
		} else {
			return {
				datetime: consumptionEntry.datetime,
				carbonEmission: null
			};
		}
	});

	return emissions;
}

async function fetchPowerConsumption(){
	try {
		const powerBreakdownResponse = await axios.get(process.env.API_URL + 'v3/power-breakdown/history', {
			headers: {'auth_token' : `${process.env.API_TOKEN}`}
		})
		if(powerBreakdownResponse.status === 200){
			const powerBreakdownData = powerBreakdownResponse.data.history;
			const powerConsumption = powerBreakdownData.map(elem => ({
				datetime: elem.datetime,
				powerConsumptionTotal: elem.powerConsumptionTotal
			}));

			return powerConsumption;
		} else {
			logger.error('Unsuccessful power breakdown response', {status: powerBreakdownResponse.status});
		}
	} catch (error) {
		throw new Error(`Error fetching power breakdown response: ${error.message}`);
	}
}

async function fetchCarbonIntensity(){
	try {
		carbonIntensityResponse = await axios.get(process.env.API_URL + 'v3/carbon-intensity/history', {
			headers: {'auth_token' : `${process.env.API_TOKEN}`}
		})
		if(carbonIntensityResponse.status === 200){
			const carbonIntensityData = carbonIntensityResponse.data.history;
			const carbonIntensity = carbonIntensityData.map(elem => ({
				datetime: elem.datetime,
				carbonIntensity: elem.carbonIntensity
			}));

			return carbonIntensity;
		} else {
			logger.error('Unsuccessful carbon intensity response', {status: carbonIntensityResponse.status});
		}
	} catch (error) {
		throw new Error(`Error fetching carbon intensity response: ${error.message}`);
	}
}

module.exports = { calculateCarbonEmissions, fetchCarbonIntensity, fetchPowerConsumption };
