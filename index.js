const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const Person = require('./models/person');

const app = express();

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

morgan.token('body', function(req, res) {
  return JSON.stringify(req.body);
});

const logger = morgan(function (tokens, req, res) {
  const tiny = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ];

  return (req.method === 'POST'
    ? [...tiny, tokens.body(req, res)]
    : tiny
  ).join(' ');
});

app.use(logger);

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people);
  });
});

app.get('/info', (req, res) => {
  Person.find({}).then(people => {
    res.send(
      `<p>Phonebook has info for ${people.length} people</p>
      <p>${new Date()}</p>`);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  const {id} = req.params;
  Person.findById(id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name && !body.number) {
    return res.status(400).json({
      error: 'Name or number required'
    });
  }

  const person = new Person({
    ...body
  });

  person
    .save()
    .then(savedPerson => {
      res.json(savedPerson);
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;
  const {id} = req.params;
  
  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  const {id} = req.params;
  Person.findByIdAndRemove(id)
    .then(result => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error('Error: ', error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted ID' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});