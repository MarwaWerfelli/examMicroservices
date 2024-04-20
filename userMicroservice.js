const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Charger le fichier schema.protoo
const userProtoPath = "schema.proto";
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(userProtoDefinition).schema;

// Implémenter le service de gestion des utilisateurs
const userService = {
  getUser: (call, callback) => {
    // Récupérer les détails de l'utilisateur à partir de la base de données
    const user = {
      id: call.request.userId,
      name: "Exemple Utilisateur",
      email: "exemple@example.com",
      // Ajouter d'autres champs de données pour l'utilisateur au besoin
    };
    callback(null, { user });
  },
  getUsers: (call) => {
    // Récupérer tous les utilisateurs à partir de la base de données
    const users = [
      {
        id: "1",
        name: "Utilisateur 1",
        email: "utilisateur1@example.com",
      },
      {
        id: "2",
        name: "Utilisateur 2",
        email: "utilisateur2@example.com",
      },
      // Ajouter d'autres utilisateurs au besoin
    ];
    users.forEach((user) => call.write({ user }));
    call.end();
  },
  addUser: (call, callback) => {
    // Ajouter un nouvel utilisateur à la base de données
    const user = {
      id: "3",
      name: call.request.name,
      email: call.request.email,
    };
    callback(null, { user });
  },
};

// Créer et démarrer le serveur gRPC pour le service de gestion des utilisateurs
const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);
const port = 50052;
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
  `Microservice de gestion des utilisateurs en cours d'exécution sur le port ${port}`
);
