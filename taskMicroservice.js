const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

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
  getTask: (call, callback) => {
    // Récupérer les détails de la tâche à partir de la base de données
    const task = {
      id: call.request.taskId,
      title: "Exemple de tâche",
      description: "Ceci est un exemple de tâche.",
      completed: false,
      assignedTo: [],
      // Ajouter d'autres champs de données pour la tâche au besoin
    };
    callback(null, { task });
  },
  getTasks: (call) => {
    // Récupérer toutes les tâches à partir de la base de données
    const tasks = [
      {
        id: "1",
        title: "Exemple de tâche 1",
        description: "Ceci est le premier exemple de tâche.",
        completed: false,
        assignedTo: [],
      },
      {
        id: "2",
        title: "Exemple de tâche 2",
        description: "Ceci est le deuxième exemple de tâche.",
        completed: false,
        assignedTo: [],
      },
      // Ajouter d'autres tâches au besoin
    ];
    tasks.forEach((task) => call.write({ task }));
    call.end();
  },
  addTask: (call, callback) => {
    // Ajouter une nouvelle tâche à la base de données
    const task = {
      id: "3", // ID de la nouvelle tâche
      title: call.request.title,
      description: call.request.description,
      completed: call.request.completed,
      assignedTo: call.request.assignedTo,
    };
    callback(null, { task });
  },
  completeTask: (call, callback) => {
    // Marquer la tâche comme terminée dans la base de données
    const task = {
      id: call.request.taskId,
      title: "Exemple de tâche",
      description: "Ceci est un exemple de tâche.",
      completed: true,
      assignedTo: [],
    };
    callback(null, { task });
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
