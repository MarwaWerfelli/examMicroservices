const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Charger les fichiers proto pour les tâches et les utilisateurs
const taskProtoPath = "schema.proto";
const userProtoPath = "schema.proto";

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

const taskProto = grpc.loadPackageDefinition(taskProtoDefinition).schema;
const userProto = grpc.loadPackageDefinition(userProtoDefinition).schema;

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
  Query: {
    task: async (_, { ID }) => {
      // Effectuer un appel gRPC au microservice des tâches pour récupérer une tâche
      const client = new taskProto.TaskService(
        "localhost:50051",
        grpc.credentials.createInsecure()
      );
      return await new Promise((resolve, reject) => {
        client.getTask({ taskId: ID }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.task);
          }
        });
      });
    },
    tasks: () => {
      // Effectuer un appel gRPC au microservice des tâches pour récupérer toutes les tâches
      const client = new taskProto.TaskService(
        "localhost:50051",
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        const call = client.getTasks();
        const tasks = [];
        call.on("data", (data) => {
          tasks.push(data.task);
        });
        call.on("end", () => {
          resolve(tasks);
        });
        call.on("error", (err) => {
          reject(err);
        });
      });
    },
    user: (_, { ID }) => {
      // Effectuer un appel gRPC au microservice des utilisateurs pour récupérer un utilisateur
      const client = new userProto.UserService(
        "localhost:50052",
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.getUser({ userId: ID }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.user);
          }
        });
      });
    },
    users: () => {
      // Effectuer un appel gRPC au microservice des utilisateurs pour récupérer tous les utilisateurs
      const client = new userProto.UserService(
        "localhost:50052",
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        const call = client.getUsers({});
        const users = [];
        call.on("data", (data) => {
          users.push(data.user);
        });
        call.on("end", () => {
          resolve(users);
        });
        call.on("error", (err) => {
          reject(err);
        });
      });
    },
  },
  Mutation: {
    addTask: (_, { title, description, completed, assignedTo }) => {
      // Effectuer un appel gRPC au microservice des tâches pour ajouter une nouvelle tâche
      const client = new taskProto.TaskService(
        "localhost:50051",
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.addTask(
          {
            title,
            description,
            completed,
            assignedTo,
          },
          (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.task);
            }
          }
        );
      });
    },
    completeTask: (_, { ID }) => {
      // Effectuer un appel gRPC au microservice des tâches pour marquer une tâche comme terminée
      const client = new taskProto.TaskService(
        "localhost:50051",
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.completeTask({ taskId: ID }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.task);
          }
        });
      });
    },
    addUser: (_, { userInput: { name, email } }) => {
      // Effectuer un appel gRPC au microservice des utilisateurs pour ajouter un nouvel utilisateur
      const client = new userProto.UserService(
        "localhost:50052",
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.addUser({ name: name, email: email }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.user);
          }
        });
      });
    },
  },
};

module.exports = resolvers;
