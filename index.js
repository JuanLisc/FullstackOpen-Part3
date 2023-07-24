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

let phonebook = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];


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
  res.send(
    `<p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>`);
});

app.get('/api/persons/:id', (req, res) => {
  const personId = Number(req.params.id);
  const person = phonebook.find(person => person.id === personId);
  
  return person
    ? res.json(person)
    : res.status(404).end();
});

app.post('/api/persons', (req, res) => {
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
    });
});

app.delete('/api/persons/:id', (request, response, next) => {
  const {id} = request.params;
  Person.findByIdAndRemove(id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});