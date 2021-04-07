const helper = require('../middleware/paypalHelper');
const Vehicule = require('../models/Vehicule');
const User = require('../models/User');

// POST Add Payement
exports.paynow = async (req, res, next) => {
  userData = req.session.passport;
  let foundUserId = await User.findById({
    _id: req.user._id
  });

  let vehicule = await Vehicule.find({ idUser: foundUserId });

  const data = {
    userID: userData.user,
    data: req.body
  }
  console.log(data);

  helper.payNow(data, function (error, result) {

    if (error) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(JSON.stringify(error));
    } else {
      userData.paypalData = result;
      userData.clientData = req.body;
      res.redirect(result.redirectUrl);
    }

  });

}

// GET Execute Payement
exports.execute = (req, res, next) => {
  userInfo = req.session.passport;
  var response = {};
  const PayerID = req.query.PayerID;

  if (!userInfo) {
    res.redirect('/user/login');
    res.end();
  } else {
    userInfo.statut = "success";
    console.log("User info execute ", userInfo);
    helper.getResponse(userInfo, PayerID, function (response) {
      res.render('paiement/paiement', {
        response: response.message
      });
    });
  }

}

// GET cancel Payement
exports.cancel = (req, res, next) => {
  userInfo = req.session.passport;

  const data = {
    userID: userInfo.user,
    data: req.body
  }

  if (!userInfo) {
    res.redirect('/user/login');
    res.end();
  } else {
    var response = {};
    response.error = true;
    response.message = "Payement unsuccessful.";
    response.userData = {
      nom: userInfo.nom
    };

    res.render('paiement/paiement', {
      response: response.message
    });

  }

}

 // userInfo = JSON.stringify(userInfo);
/*
  const data = {
    userID: userInfo.user,
    idVehicule: userInfo.clientData._id,
    num_plaque: userInfo.clientData.num_plaque,
    refPaiement: userInfo.paypalData.paymentId,
    date_paiement: userInfo.paypalData.payement.create_time,
    statut: userInfo.clientData.statut,
    currency: userInfo.paypalData.payement.transactions[0].amount.currency,
    cout: parseFloat(userInfo.paypalData.payement.transactions[0].amount.total)  
  }

  console.log(data);
*/
  /*
    
  */

/*
	userID: data.user,
			idVehicule: data.clientData._id,
			num_plaque: data.clientData.num_plaque,
			refPaiement: data.paypalData.paymentId,
			date_paiement: data.paypalData.payement.create_time,
			statut: data.statut,
			currency: data.paypalData.payement.transactions[0].amount.currency,
			cout: serverAmount

*/

/*
'client_id': 'AQrVUYKYTX4N4KGPie02y7JazAsIXYeWdUJjta0aq-RXX8Ihbx_KgEkuMNYp-CpHjMwKytPfi6wsLgEl',
'client_secret': 'EH4O_frRdGe3YpbwK52zmgOFLPL_X43vZTZDRKD8Z7ueB28BJjE6dmqJ4LDTcQkdknG30SB5cPkw4Cr6'
*/

/*
// success payement
exports.sucessPayement = async (req, res, next) => {

  const foundUserId = await User.findById({ _id: req.user._id });

  const foundVehiculePrice = await Vehicule.find({ idUser: foundUserId });

  const paymentInfo = {
    paymentId: req.query.paymentId,
    PayerID: req.query.PayerID
  };

  const paiement = {
    "payer_id": paymentInfo.PayerID,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": foundVehiculePrice.prix
      }
    }]
  }

  paypal.payment.execute(paymentInfo.paymentId, paiement, (err, paiement) => {
    if (err) console.err(err);
    console.log(paiement);
    res.send('Paiement effectué');
  });

}

// error paiement
exports.errorPaiement = async (req, res, next) => {
  const foundUserId = await User.findById({ _id: req.user._id });

  const foundVehiculePrice = await Vehicule.find({ idUser: foundUserId });

  const historique_paiement = new Historique({
    idUser: foundUserId,
    idVehicule: foundVehiculePrice._id,
    num_plaque: foundVehiculePrice.num_plaque,
    cout: foundVehiculePrice.prix,
    refPaiement: "Nul",
    date_paiement: Date.now(),
    statut: "Echec"
  });

  historique_paiement.save().then((result) => {
    res.status(200).json({
        result: result,
        message: 'Historique has been created for error'
    });
}).catch((error) => {
    res.status(400).json({ 'error': error })
});
}

//Get Single Level
exports.getPayementByUser = async (req, res, next) => {

  let foundUserId = await User.findById({
    _id: req.user._id
  });

  await Historique.find({
    idUser: foundUserId
  }).then((result) => {
    res.status(200).json({
      result: result,
      message: 'User Transaction'
    });
  }).catch((error) => {
    res.status(400).json({ 'error': error })
  });

}



exports.postPayement = async (req, res, next) => {
  paiement(req, res);
}

async function paiement(req, res) {

  const foundUserId = await User.findById({ _id: req.user._id });

  const foundVehiculePrice = await Vehicule.find({ idUser: foundUserId });

  paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AQrVUYKYTX4N4KGPie02y7JazAsIXYeWdUJjta0aq-RXX8Ihbx_KgEkuMNYp-CpHjMwKytPfi6wsLgEl',
    'client_secret': 'EH4O_frRdGe3YpbwK52zmgOFLPL_X43vZTZDRKD8Z7ueB28BJjE6dmqJ4LDTcQkdknG30SB5cPkw4Cr6'
  });

  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/paiement/success",
      "cancel_url": "http://localhost:3000/paiement/error"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Payement vignette",
          "sku": "001",
          "price": foundVehiculePrice.prix,
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": foundVehiculePrice.prix
      },
      "description": "This is the payment description."
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.log("Erreur dans la création du paiement \n"+ error.message);
    } else {
      console.log("Create Payment Response");
      for (l in payment.links) {
        if (payment.links[l].rel == "approval_url") {
          res.redirect(payment.links[l].href);
        }
      }
    }
  });

}

*/

/*
<a href="http://localhost:3000/paiement/paynow" >
</a>
*/
