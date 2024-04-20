const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");

// Charger le modèle de tâche défini avec Mongoose
const Task = require("./models/Task");

// Charger le fichier schema.proto
const taskProtoPath = "schema.proto";
const taskProtoDefinition = protoLoader.loadSync(taskProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const taskProto = grpc.loadPackageDefinition(taskProtoDefinition).schema;

// Connecter à la base de données MongoDB avec Mongoose
mongoose.connect("mongodb://localhost:27017/taskdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Vérifier la connexion à la base de données
const db = mongoose.connection;
console.log({ db });
db.on(
  "error",
  console.error.bind(console, "Erreur de connexion à la base de données :")
);
db.once("open", () => {
  console.log("Connecté à la base de données MongoDB.");
});

// Implémenter le service de gestion des tâches
const taskService = {
  getTask: async (call, callback) => {
    // Récupérer les détails de la tâche à partir de la base de données MongoDB
    Task.findById(call.request.taskId, (err, task) => {
      if (err) {
        callback(err);
      } else {
        callback(null, { task });
      }
    });
  },
  getTasks: async (call) => {
    try {
      // Récupérer toutes les tâches à partir de la base de données MongoDB
      const tasks = await Task.find();
      console.log(tasks);
      return tasks;
      tasks.forEach((task) => call.write({ task }));

      // call.end();
      return tasks;
    } catch (err) {
      call.emit("error", err);
    }
  },
  addTask: (call, callback) => {
    // Ajouter une nouvelle tâche à la base de données MongoDB
    const newTask = new Task({
      title: call.request.title,
      description: call.request.description,
      completed: call.request.completed,
      assignedTo: call.request.assignedTo,
    });

    try {
      newTask.save();
      return callback(null, { newTask });
    } catch (error) {
      return callback(null, {});
    }
  },
  completeTask: (call, callback) => {
    // Marquer la tâche comme terminée dans la base de données MongoDB
    Task.findByIdAndUpdate(
      call.request.taskId,
      { completed: true },
      { new: true }, // Pour renvoyer la tâche mise à jour
      (err, task) => {
        if (err) {
          callback(err);
        } else {
          callback(null, { task });
        }
      }
    );
  },
};

// Créer et démarrer le serveur gRPC pour le service de gestion des tâches
const server = new grpc.Server();
server.addService(taskProto.TaskService.service, taskService);
const port = 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Échec de la liaison du serveur:", err);
      return;
    }
    console.log(`Le serveur s'exécute sur le port ${port}`);
    server.start();
  }
);
console.log(
  `Microservice de gestion des tâches en cours d'exécution sur le port ${port}`
);
