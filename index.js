const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
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
  res.json(phonebook);
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

  if (phonebook.find(person => person.name === body.name)) {
    return res.status(400).json({
      error: 'This person already exists in phonebok'
    });
  }

  const person = {
    ...body,
    id: getRandomInt(100)
  };

  phonebook = phonebook.concat(person);

  res.json(person);
});

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});