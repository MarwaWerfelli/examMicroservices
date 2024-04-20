const mongoose = require("mongoose");

// Définir le schéma de la tâche avec Mongoose
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

// Créer le modèle de tâche à partir du schéma défini
const User = mongoose.model("User", userSchema);

module.exports = User;
