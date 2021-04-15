const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/historique.controller');
const auth = require('../config/auth');
const passport = require('passport');

// GET transaction
router.get('/getransaction', auth.ensureAuthenticated, transactionController.getPaiement);

// Paynow
router.post('/paynow', auth.ensureAuthenticated, transactionController.paynow);

/*
* payment success url 
*/
router.get('/execute', transactionController.execute);

/*
* payment cancel url 
*/
router.get('/cancel', transactionController.cancel);


module.exports = router;

/*
<div>
            <h1> <%= response %>  </h1>
            </div>
*/

/*
//Post add transaction
router.post('/payement', auth.ensureAuthenticated, transactionController.postPayement);

router.get('/payement', function (req, res) {
  res.render('paiement/paiement');
});


router.get('/', function (req, res) {
  res.redirect('paiement/payement');
});


//get payement
router.get('/listpayement', auth.ensureAuthenticated, transactionController.getPayementByUser);
router.get('/success', auth.ensureAuthenticated, transactionController.sucessPayement);
router.get('/error', auth.ensureAuthenticated, transactionController.errorPaiement);
*/

