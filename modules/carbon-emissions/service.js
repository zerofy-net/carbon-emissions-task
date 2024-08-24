const axios = require("axios");

function calculateCarbonEmissions(consumption, intensity) {
	return emissions;
}

async function fetchPowerConsumption(){
	try {
		const powerBreakdownResponse = await axios.get(process.env.API_URL + 'v3/power-breakdown/history', {
			headers: {'auth_token' : `${process.env.API_TOKEN}`}
		})
		if(powerBreakdownResponse.status === 200){
			const powerConsumption = powerBreakdownResponse.map(elem => ({
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
			const carbonIntensity = powerBreakdownResponse.map(elem => ({
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
