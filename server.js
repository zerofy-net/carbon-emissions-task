const express = require('express');

const app = express();

/**
 * Simple route to check the health of the server.
 */
app.get('/health', (request, response) => {
  const healthCheck = {
    message: 'OK'
  };
  response.send(healthCheck);
});

/**
 * Updates the carbon emissions with the latest data from electricitymaps.com.
 */
app.post('/emissions/update', (request, response) => {
  response.send({
    updatedAt: "2024-08-19 16:23"
  });
});

/**
 * Returns the total carbon emissions for the requested date (YYYY-mm-dd).
 * For example, `curl -i http://localhost:3000/emissions/2024-08-19`.
 */
app.get('/emissions/:date', (request, response) => {
  response.send({
    date: request.params.date
  })
});

app.listen(3000, () => console.log('Server is listening on port 3000'));
