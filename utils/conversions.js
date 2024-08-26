/**
 * Converts megawatts (MW) to watts (W).
 * @param {number} megawatts - The power in megawatts.
 * @returns {number} - The power in watts.
 */
function megawattsToWatts(megawatts) {
    return megawatts * 1_000_000;
}

/**
 * Converts carbon intensity from g/kWh to g/Wh.
 * @param {number} carbonIntensityInGPerKWh - The carbon intensity in grams per kilowatt-hour.
 * @returns {number} - The carbon intensity in grams per watt-hour.
 */
function carbonIntensityGPerKWhToGPerWh(carbonIntensityInGPerKWh) {
    return carbonIntensityInGPerKWh * 0.001;
}

module.exports = {
    megawattsToWatts,
    carbonIntensityGPerKWhToGPerWh,
};
