const mongoose = require('mongoose');

var VehiculeSchema = new mongoose.Schema({
  num_plaque: {
    type: String,
    required: true,
    unique: true
  },
  marque: {
    type: String,
    required: true
  },
  modele: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  puissance: {
    type: Number,
    required: true
  },
  couleur:{
    type: String
  },
  annee_fabrication:{
    type: Date,
    require: true
  },
  num_chassis:{
    type: String,
    required: true
  },
  prix:{
    type: Number,
    required: true
  },
  pic:{
    type: String
  },
  idUser:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"User"
  }
}, {timestamps: true});

const Vehicule = mongoose.model('Vehicule', VehiculeSchema);

module.exports = Vehicule;