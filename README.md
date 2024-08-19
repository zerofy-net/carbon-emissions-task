# electricity-maps-task

Coding task using the Electricity Maps API

Welcome to the Electricity Maps coding assessment! In this task, you'll be working with the Electricity Maps API to
collect and process data, then store it in a MongoDB database. The goal is to assess your ability to work with APIs,
perform calculations based on data, and interact with a NoSQL database.

## Prerequisites

Before starting, make sure you have the following set up:

1. **MongoDB**: You will need to install MongoDB on your local machine. You can download
   it [here](https://www.mongodb.com/try/download/community).
2. **Electricity Maps API Token**: Sign up and select an API plan
   at [Electricity Maps](https://api-portal.electricitymaps.com/). Obtain an API token, which you'll use to make
   requests.

## Steps to Complete the Task

1. **Fork the Repository**: Start by creating a private fork of the provided
   repository. Clone the forked repository
   to your local machine.

2. **Install MongoDB**: If you haven't already, install MongoDB Community Edition on your machine.

3. **Obtain Electricity Maps API Token**: Sign up on the Electricity Maps API portal, select the personal use plan, and
   obtain your API token.

4. **Install Project Dependencies**: Navigate to the project directory and run `npm install` to install the necessary
   Node.js dependencies.

5. **Update the Daily Carbon Emissions**:
    - **Fetch Data**: Create an endpoint that triggers a function to fetch the last 24 hours of carbon
      intensity and power breakdown history using the Electricity Maps API.
    - **Match and Calculate**: Match each hour between the two results to calculate carbon emissions based on the carbon
      intensity and total power consumption. Be mindful of the units—power consumption is given in both W and Wh even
      though the api documents say the units are MW.
    - **Store in MongoDB**: Store each hourly result as a separate document in your MongoDB database.

6. **Create an Endpoint for Daily Carbon Emissions**:
    - Create another endpoint that accepts a date `yyyy-mm-dd`. This endpoint should return the total
      carbon emissions for that day, as well as an array of hourly carbon emissions. If any hourly data is missing,
      return `null` for that hour.

7. **Submit Your Work**:
    - Once you've completed the task choose 1 option: 
      1. Open a Pull Request (PR) against your forked repo. Give @david-zerofy access to your forked repository, so we can review 
      your code/PR.
      2. Zip your project and send it to us via email.
    - Notify us that you have completed the task.

## Tips

- Refer to the Electricity Maps API
  documentation [here](https://static.electricitymaps.com/api/docs/index.html#recent-power-breakdown-history) to
  understand the API endpoints and data structure.
- Ensure that your calculations correctly account for the units provided by the API.
- Partial data for a given day is acceptable; focus on handling missing values gracefully by returning `null`.

We look forward to reviewing your work! Good luck!
