const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    max: 70
  },
  postnom: {
    type: String,
    required: true,
    max: 70
  },
  prenom: {
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
  },
  avatar: {
    type: String
  },
  telephone: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    min: 8
  },
  vehicule: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vehicule'
  }],
  historique_transaction: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Historique_transaction'
  }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;