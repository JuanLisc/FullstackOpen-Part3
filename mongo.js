const mongoose = require('mongoose');

if (process.argv.length<3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url =
  `mongodb+srv://lischetti_juan:${password}@jlcluster.uc9j5fe.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set('strictQuery',false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  return Person.find({}).then(result => {
    console.log('Phonebook:');
    result.forEach(person => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}

const person = new Person({
  name: process.argv[3],
  number: process.argv[4]
});

// eslint-disable-next-line no-unused-vars
person.save().then(result => {
  console.log(`Added ${person.name} ${person.number} to phonebook.`);
  mongoose.connection.close();
});
