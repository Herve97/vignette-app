const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth');
const vehiculeController = require('../controllers/vehicule.controller');
const auth = require('../config/auth');

// GET add vehicule
router.get('/addvehicule', auth.ensureAuthenticated, vehiculeController.getAddVehicule);

//Post add vehicule
router.post('/addvehicule', auth.ensureAuthenticated, vehiculeController.postVehicule);

//Delete User
router.delete('/delete/:num_plaque', auth.ensureAuthenticated, vehiculeController.deleteVehicule);

//Login
router.put('/update', auth.ensureAuthenticated, vehiculeController.editVehicule);

//Login
router.get('/getcarbyid', auth.ensureAuthenticated, vehiculeController.getVehiculeByUser);

module.exports = router;
