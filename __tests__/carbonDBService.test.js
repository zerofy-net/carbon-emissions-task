const { storeHourlyEmissions } = require('../modules/carbon-emissions/dbservice');
const CarbonEmission = require('../modules/carbon-emissions/model');
const logger = require('../logs/logger');

jest.mock('../modules/carbon-emissions/model');
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


describe('storeHourlyEmissions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should store new emissions data', async () => {
        const emissions = [
            { datetime: '2024-08-24T00:00:00Z', carbonEmission: 3000 },
            { datetime: '2024-08-24T01:00:00Z', carbonEmission: 4000 },
        ];

        CarbonEmission.findOne.mockResolvedValue(null);
        CarbonEmission.bulkWrite.mockResolvedValue({});

        await storeHourlyEmissions(emissions);

        expect(CarbonEmission.findOne).toHaveBeenCalledTimes(2);
        expect(CarbonEmission.bulkWrite).toHaveBeenCalledWith([
            {
                updateOne: {
                    filter: { datetime: '2024-08-24T00:00:00Z' },
                    update: { $set: { carbonEmission: 3000 } },
                    upsert: true,
                },
            },
            {
                updateOne: {
                    filter: { datetime: '2024-08-24T01:00:00Z' },
                    update: { $set: { carbonEmission: 4000 } },
                    upsert: true,
                },
            },
        ]);
        expect(logger.info).toHaveBeenCalledWith('Stored 2 fresh emission records in the database.');
    });

    it('should not store data if no fresh emissions are found', async () => {
        const emissions = [
            { datetime: '2024-08-24T00:00:00Z', carbonEmission: 3000 },
        ];

        CarbonEmission.findOne.mockResolvedValue({ carbonEmission: 3000 });

        await storeHourlyEmissions(emissions);

        expect(CarbonEmission.bulkWrite).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith('No fresh emissions data to store.');
    });

    it('should handle errors during database queries', async () => {
        const emissions = [
            { datetime: '2024-08-24T00:00:00Z', carbonEmission: 3000 },
        ];

        CarbonEmission.findOne.mockRejectedValue(new Error('Database error'));

        await expect(storeHourlyEmissions(emissions)).rejects.toThrow('Database query failed');
        expect(logger.error).toHaveBeenCalledWith('Error querying the database:', { error: 'Database error' });
    });

    it('should handle errors during bulk write operations', async () => {
        const emissions = [
            { datetime: '2024-08-24T00:00:00Z', carbonEmission: 3000 },
        ];

        CarbonEmission.findOne.mockResolvedValue(null);

        CarbonEmission.bulkWrite.mockRejectedValue(new Error('Bulk write error'));

        await expect(storeHourlyEmissions(emissions)).rejects.toThrow('Bulk write operation failed');
        expect(logger.error).toHaveBeenCalledWith('Error making bulk operations and performing bulkWrite:', { error: 'Bulk write error' });
    });
});
