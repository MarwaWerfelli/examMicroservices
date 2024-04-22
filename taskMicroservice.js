const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

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

// Implémenter le service de gestion des tâches
const taskService = {
  getTask: async (call, callback) => {
    // Récupérer les détails de la tâche à partir de la base de données MongoDB
    await Task.findById(call.request.taskId, (err, task) => {
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
      tasks.forEach((task) => call.write({ task }));
      call.end();
    } catch (err) {
      call.emit("error", err);
    }
  },
  addTask: async (call, callback) => {
    // Ajouter une nouvelle tâche à la base de données MongoDB
    const newTask = new Task({
      title: call.request.title,
      description: call.request.description,
      completed: call.request.completed,
      assignedTo: call.request.assignedTo,
    });

    try {
      await newTask.save();
      return callback(null, { newTask });
    } catch (error) {
      return callback(null, {});
    }
  },
  completeTask: async (call, callback) => {
    // Marquer la tâche comme terminée dans la base de données MongoDB
    await Task.findByIdAndUpdate(
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
