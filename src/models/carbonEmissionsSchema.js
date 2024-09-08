import mongoose from "mongoose";

const carbonEmissionSchema = new mongoose.Schema({
    hour: Date,
    carbonEmissions: Number,
    carbonIntensity: Number,
    powerConsumption: Number,
});

const CarbonEmission = mongoose.model("CarbonEmission", carbonEmissionSchema);
export default CarbonEmission;
