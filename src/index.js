const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
	res.status(200).send({message: 'Hello world!'});
});

app.listen(port, () => {
	console.log('Started listening on', port);
});

module.exports = app;
