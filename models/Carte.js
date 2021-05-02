const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  num: {
    type: String
  },
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  titulaire: {
    type: mongoose.Schema.Types.nom,
    required: true,
    ref: "User"
  }
}, { timestamps: true });

const Carte = mongoose.model('Carte', historiqueSchema);

module.exports = Carte;
