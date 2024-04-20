const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const User = require("./models/User");
const { log } = require("@grpc/grpc-js/build/src/logging");
const { default: mongoose } = require("mongoose");

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
  getUsers: async (call) => {
    // Récupérer tous les utilisateurs à partir de la base de données
    try {
      // Récupérer tous les utilisateurs à partir de la base de données MongoDB
      const users = await User.find({});
      users.forEach((user) => call.write({ user: JSON.stringify(user) }));
      call.end();
    } catch (err) {
      call.emit("error", err);
    }
  },
  addUser: async (call, callback) => {
    const newUser = new User({
      name: call.request.name,
      email: call.request.email,
    });

    try {
      newUser.save();
      return callback(null, { newUser });
    } catch (error) {
      return callback(null, {});
    }
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
