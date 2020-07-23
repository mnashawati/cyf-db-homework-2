const dotenv = require("dotenv");
const express = require("express");
const mongodb = require("mongodb");

const { getPutBodyIsAllowed } = require("./util");

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

const uri = process.env.DATABASE_URI;

app.post("/api/books", function (request, response) {
  // Make this work!
  const client = new mongodb.MongoClient(uri);
  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    let bookToAdd = request.query ? request.query : request.body;

    collection.insertOne(bookToAdd, function (error, result) {
      response.send(error || result.ops[0]);
      client.close();
    });
  });
});

app.delete("/api/books/:id", function (request, response) {
  // Make this work, too!
  const client = new mongodb.MongoClient(uri);

  let id;
  try {
    id = new mongodb.ObjectID(request.params.id);
  } catch (error) {
    response.sendStatus(400);
    return;
  }

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const bookToDelete = { _id: id };

    collection.deleteOne(bookToDelete, function (error, result) {
      if (error) {
        response.status(500).send(error);
      } else if (result.deletedCount) {
        response.sendStatus(204);
      } else {
        response.sendStatus(404);
      }
      client.close();
    });
  });
});

app.put("/api/books/:id", function (request, response) {
  // Also make this work!
  const client = new mongodb.MongoClient(uri);

  let id;
  try {
    id = new mongodb.ObjectID(request.params.id);
  } catch (error) {
    response.sendStatus(400);
    return;
  }

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const bookToUpdate = { _id: id };

    const {
      title,
      author,
      author_birth_year,
      author_death_year,
      url,
    } = request.body;

    const updateObject = {
      $set: {
        title,
        author,
        author_birth_year,
        author_death_year,
        url,
      },
    };

    console.log({ bookToUpdate }, { updateObject }, request.body);

    const options = { returnOriginal: false };

    collection.findOneAndUpdate(bookToUpdate, updateObject, options, function (
      error,
      result
    ) {
      console.log(result, error);
      response.send(error || result.value);
      client.close();
    });
  });
});

app.get("/api/books", function (request, response) {
  const client = new mongodb.MongoClient(uri);

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const searchObject = {};

    if (request.query.title) {
      searchObject.title = request.query.title;
    }

    if (request.query.author) {
      searchObject.author = request.query.author;
    }

    collection.find(searchObject).toArray(function (error, books) {
      response.send(error || books);
      client.close();
    });
  });
});

app.get("/api/books/:id", function (request, response) {
  const client = new mongodb.MongoClient(uri);

  let id;
  try {
    id = new mongodb.ObjectID(request.params.id);
  } catch (error) {
    response.sendStatus(400);
    return;
  }

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const searchObject = { _id: id };

    collection.findOne(searchObject, function (error, book) {
      if (!book) {
        response.sendStatus(404);
      } else {
        response.send(error || book);
      }

      client.close();
    });
  });
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.get("/books/new", function (request, response) {
  response.sendFile(__dirname + "/new-book.html");
});

app.get("/books/:id", function (request, response) {
  response.sendFile(__dirname + "/book.html");
});

app.get("/books/:id/edit", function (request, response) {
  response.sendFile(__dirname + "/edit-book.html");
});

app.get("/authors/:name", function (request, response) {
  response.sendFile(__dirname + "/author.html");
});

app.listen(port || 3000, function () {
  console.log(`Running at \`http://localhost:${port}\`...`);
});
