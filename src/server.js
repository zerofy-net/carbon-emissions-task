import dotenv from "dotenv";
import app from "./app.js";
import { connectToDB } from "./configs/database.js";

dotenv.config();
const port = process.env.PORT || 3000;

app.listen(port, async () => {
    await connectToDB();
    console.log(`Server is listening on port ${port}`);
});
