const axios = require('axios');
const { checkHealth, updateCarbonEmissions, getDailyEmissions } = require('../modules/carbon-emissions/controller');
const { getDailyEmissionsFromDB } = require('../modules/carbon-emissions/dbservice');
const { fetchPowerConsumption, fetchCarbonIntensity, calculateCarbonEmissions } = require('../modules/carbon-emissions/service');
const CarbonEmission = require('../modules/carbon-emissions/model');
const logger = require('../logs/logger');
jest.mock('../logs/logger');

const { format } = require('date-fns');
jest.mock('axios');
jest.mock('../modules/carbon-emissions/service');
jest.mock('../modules/carbon-emissions/dbservice');
jest.mock('node-cron', () => ({
    schedule: jest.fn(),
}));
jest.mock('winston', () => {
    const info = jest.fn();
    const error = jest.fn();
    const mockTransport = jest.fn();

    return {
        createLogger: jest.fn().mockReturnValue({
            info,
            error,
        }),
        format: {
            combine: jest.fn().mockReturnThis(),
            colorize: jest.fn().mockReturnThis(),
            timestamp: jest.fn().mockReturnThis(),
            printf: jest.fn().mockImplementation(({ timestamp, level, message }) => {
                return `${timestamp} ${level}: ${message}`;
            }),
            json: jest.fn().mockReturnThis(),
        },
        transports: {
            Console: jest.fn().mockImplementation(() => mockTransport),
        },
    };
});

jest.mock('../modules/carbon-emissions/model', () => ({
    findOne: jest.fn(),
    bulkWrite: jest.fn(),
}));

beforeEach(() => {
    jest.resetAllMocks();
});


describe('checkHealth', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
    });

    it('should return health check data when the API is healthy', async () => {
        axios.get.mockResolvedValue({
            data: {
                status: 'healthy',
                monitors: {},
            },
        });

        await checkHealth(req, res);

        expect(axios.get).toHaveBeenCalledWith('https://api.electricitymap.org/health');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            serverStatus: 'OK',
            apiStatus: 'healthy',
            apiMonitors: {},
        });
    });

    it('should return 500 status when there is an error', async () => {
        const errorMessage = 'Network Error';
        axios.get.mockRejectedValue(new Error(errorMessage));

        await checkHealth(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            serverStatus: 'OK',
            apiStatus: 'Unavailable',
            errorMessage,
        });
    });
});

describe('updateCarbonEmissions', () => {
    let res;
  
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      fetchPowerConsumption.mockReset();
      fetchCarbonIntensity.mockReset();
      calculateCarbonEmissions.mockReset();
      CarbonEmission.findOne.mockReset();
      logger.info.mockReset();
      logger.error.mockReset();
    });
  
    it('should return 204 if no emissions data is available to store', async () => {
        fetchPowerConsumption.mockResolvedValue([{ datetime: '2023-08-26T00:00:00Z', powerConsumptionTotal: 100 }]);
        fetchCarbonIntensity.mockResolvedValue([{ datetime: '2023-08-26T00:00:00Z', carbonIntensity: 50 }]);
        calculateCarbonEmissions.mockReturnValue([]);

        await updateCarbonEmissions(null, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: 'No data available to store.' });
    });

    it('should handle errors and return 500 with error message', async () => {
        const error = new Error('Test error');
        fetchPowerConsumption.mockRejectedValue(error);

        await updateCarbonEmissions(null, res);

        expect(logger.error).toHaveBeenCalledWith('Error fetching and storing hourly emissions data:', { error: error.message });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });



describe('getDailyEmissions', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { date: '2024-08-24' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return total emissions and hourly emissions for a valid date', async () => {
        const mockHourlyEmissions = [100, 200, null, 50, 75, 0, 0, null, 0, 0, 0, null, null, null, null, null, 0, 0, 0, 0, 0, 0, 0, 0];
        getDailyEmissionsFromDB.mockResolvedValue(mockHourlyEmissions);

        await getDailyEmissions(req, res);

        expect(getDailyEmissionsFromDB).toHaveBeenCalledWith(req.params.date);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            date: '2024-08-24',
            totalEmissionsPerDay: 425,
            hourlyEmissions: mockHourlyEmissions,
        });
    });

    it('should return 204 status if no emissions data found', async () => {
        getDailyEmissionsFromDB.mockResolvedValue([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);

        await getDailyEmissions(req, res);

        expect(getDailyEmissionsFromDB).toHaveBeenCalledWith(req.params.date);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            date: '2024-08-24',
            totalEmissionsPerDay: 0,
            hourlyEmissions: Array(24).fill(null),
        });
    });

    it('should return 400 status for an invalid date format', async () => {
        req.params.date = 'invalid-date';

        await getDailyEmissions(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    });

    it('should return 500 status if there is a database error', async () => {
        const errorMessage = 'Database error';
        getDailyEmissionsFromDB.mockRejectedValue(new Error(errorMessage));

        await getDailyEmissions(req, res);

        expect(getDailyEmissionsFromDB).toHaveBeenCalledWith(req.params.date);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
});