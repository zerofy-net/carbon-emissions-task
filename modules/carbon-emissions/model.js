const mongoose = require('mongoose');

const carbonEmissionSchema = new mongoose.Schema({
    datetime: { type: Date, unique: true },
    carbonEmission: { type: Number, required: true },
});

const CarbonEmission = mongoose.model('CarbonEmission', carbonEmissionSchema);



module.exports = CarbonEmission;
