const mongoose = require("mongoose");

// Définir le schéma de la tâche avec Mongoose
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Créer le modèle de tâche à partir du schéma défini
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
