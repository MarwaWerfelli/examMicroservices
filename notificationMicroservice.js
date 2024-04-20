const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Charger le fichier notification.proto
const notificationProtoPath = "schema.proto";
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
const notificationProto = grpc.loadPackageDefinition(
  notificationProtoDefinition
).schema;

// Implémenter le service de gestion des notifications
const notificationService = {
  getNotification: (call, callback) => {
    // Récupérer les détails de la notification à partir de la base de données
    const notification = {
      id: call.request.notificationId,
      message: "Exemple de notification",
      seen: false,
      userId: "1",
      // Ajouter d'autres champs de données pour la notification au besoin
    };
    callback(null, { notification });
  },
  getNotifications: (call, callback) => {
    // Récupérer toutes les notifications à partir de la base de données
    const notifications = [
      {
        id: "1",
        message: "Exemple de notification 1",
        seen: false,
        userId: "1",
      },
      {
        id: "2",
        message: "Exemple de notification 2",
        seen: false,
        userId: "2",
      },
      // Ajouter d'autres notifications au besoin
    ];
    notifications.forEach((notification) => call.write({ notification }));
    call.end();
  },
};

// Créer et démarrer le serveur gRPC pour le service de gestion des notifications
const server = new grpc.Server();
server.addService(
  notificationProto.NotificationService.service,
  notificationService
);
const port = 50053;
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
  `Microservice de gestion des notifications en cours d'exécution sur le port ${port}`
);
