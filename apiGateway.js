// apiGateway.js
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Charger les fichiers proto pour les tâches, utilisateurs et notifications
const taskProtoPath = "schema.proto";
const userProtoPath = "schema.proto";
const notificationProtoPath = "schema.proto";
const resolvers = require("./resolvers");
const typeDefs = require("./schema");

// Créer une nouvelle application Express
const app = express();

const taskProtoDefinition = protoLoader.loadSync(taskProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const notificationProtoDefinition = protoLoader.loadSync(
  notificationProtoPath,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);
const taskProto = grpc.loadPackageDefinition(taskProtoDefinition).schema;
const userProto = grpc.loadPackageDefinition(userProtoDefinition).schema;
const notificationProto = grpc.loadPackageDefinition(
  notificationProtoDefinition
).schema;

// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });

// Appliquer le middleware ApolloServer à l'application Express
server.start().then(() => {
  app.use(cors(), bodyParser.json(), expressMiddleware(server));
});
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
// taskProto Endpoints
app.get("/tasks", (req, res) => {
  const client = new taskProto.TaskService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  client.getTasks({}, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.tasks);
    }
  });
});

app.get("/tasks/:id", (req, res) => {
  const client = new taskProto.TaskService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  const taskId = req.params.id;
  client.getTask({ taskId }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.task);
    }
  });
});

app.post("/tasks", (req, res) => {
  const { title, description, completed, assignedTo } = req.body;
  const client = new taskProto.TaskService(
    "localhost:50051",
    grpc.credentials.createInsecure()
  );
  client.addTask(
    { title, description, completed, assignedTo },
    (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.task);
      }
    }
  );
});

// userProto Endpoints
app.get("/users", (req, res) => {
  const client = new userProto.UserService(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );
  client.getUsers({}, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.users);
    }
  });
});

app.get("/users/:id", (req, res) => {
  const client = new userProto.UserService(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );
  const userId = req.params.id;
  client.getUser({ userId }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.user);
    }
  });
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;
  const client = new userProto.UserService(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );
  client.addUser({ name, email }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.user);
    }
  });
});

// notificationProto Endpoint
app.post("/sendNotification", (req, res) => {
  const { userId, message } = req.body;
  const client = new notificationProto.NotificationService(
    "localhost:50053",
    grpc.credentials.createInsecure()
  );
  client.sendNotification({ userId, message }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response);
    }
  });
});

// Démarrer l'application Express
const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway en cours d'exécution sur le port ${port}`);
});
