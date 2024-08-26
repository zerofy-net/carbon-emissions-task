const { fetchPowerConsumption, fetchCarbonIntensity, calculateCarbonEmissions } = require('../modules/carbon-emissions/service');
const axios = require('axios');

jest.mock('axios');

describe('calculateCarbonEmissions', () => {
    it('should calculate carbon emissions correctly with valid data', () => {
        const consumption = [
            { datetime: '2024-08-24T00:00:00Z', powerConsumptionTotal: 10 },
            { datetime: '2024-08-24T01:00:00Z', powerConsumptionTotal: 20 },
        ];
        const intensity = [
            { datetime: '2024-08-24T00:00:00Z', carbonIntensity: 300 },
            { datetime: '2024-08-24T01:00:00Z', carbonIntensity: 400 },
        ];

        const result = calculateCarbonEmissions(consumption, intensity);

        expect(result).toEqual([
            { datetime: '2024-08-24T00:00:00Z', carbonEmission: 3000000 },
            { datetime: '2024-08-24T01:00:00Z', carbonEmission: 8000000 },
        ]);
    });

    it('should return null emissions for timestamps with missing intensity data', () => {
        const consumption = [
            { datetime: '2024-08-24T00:00:00Z', powerConsumptionTotal: 10 },
            { datetime: '2024-08-24T01:00:00Z', powerConsumptionTotal: 20 },
        ];
        const intensity = [
            { datetime: '2024-08-24T00:00:00Z', carbonIntensity: 300 },
            // Missing intensity for the second timestamp
        ];

        const result = calculateCarbonEmissions(consumption, intensity);

        expect(result).toEqual([
            { datetime: '2024-08-24T00:00:00Z', carbonEmission: 3000000 },
            { datetime: '2024-08-24T01:00:00Z', carbonEmission: null },
        ]);
    });

    it('should throw an error for invalid input', () => {
        expect(() => calculateCarbonEmissions(null, [])).toThrow('Invalid input: Consumption and carbon intensity data should be arrays');
        expect(() => calculateCarbonEmissions([], null)).toThrow('Invalid input: Consumption and carbon intensity data should be arrays');
    });
});


describe('fetchPowerConsumption', () => {
    it('should fetch power consumption data successfully', async () => {
        const mockData = {
            data: {
                history: [
                    { datetime: '2024-08-24T00:00:00Z', powerConsumptionTotal: 10 },
                    { datetime: '2024-08-24T01:00:00Z', powerConsumptionTotal: 20 },
                ],
            },
            status: 200,
        };

        axios.get.mockResolvedValue(mockData);

        const result = await fetchPowerConsumption();

        expect(result).toEqual([
            { datetime: '2024-08-24T00:00:00Z', powerConsumptionTotal: 10 },
            { datetime: '2024-08-24T01:00:00Z', powerConsumptionTotal: 20 },
        ]);
    });

    it('should throw an error when API request fails', async () => {
        axios.get.mockRejectedValue(new Error('API failure'));

        await expect(fetchPowerConsumption()).rejects.toThrow('Error fetching power breakdown response: API failure');
    });
});


describe('fetchCarbonIntensity', () => {
    it('should fetch carbon intensity data successfully', async () => {
        const mockData = {
            data: {
                history: [
                    { datetime: '2024-08-24T00:00:00Z', carbonIntensity: 300 },
                    { datetime: '2024-08-24T01:00:00Z', carbonIntensity: 400 },
                ],
            },
            status: 200,
        };

        axios.get.mockResolvedValue(mockData);

        const result = await fetchCarbonIntensity();

        expect(result).toEqual([
            { datetime: '2024-08-24T00:00:00Z', carbonIntensity: 300 },
            { datetime: '2024-08-24T01:00:00Z', carbonIntensity: 400 },
        ]);
    });

    it('should throw an error when API request fails', async () => {
        axios.get.mockRejectedValue(new Error('API failure'));

        await expect(fetchCarbonIntensity()).rejects.toThrow('Error fetching carbon intensity response: API failure');
    });
});