const mongoose = require('mongoose');
const crypto = require('crypto');
const historiqueSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  idVehicule: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Vehicule"
  },
  num_plaque: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    default: "USD"
  },
  cout: {
    type: Number
  },
  refPaiement: {
    type: String
  },
  date_paiement: {
    type: Date
  },
  statut: {
    type: String
  }
}, { timestamps: true });

const Vehicule = mongoose.model('Historique_transaction', historiqueSchema);

module.exports = Vehicule;

/*




*/