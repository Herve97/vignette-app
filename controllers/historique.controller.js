const helper = require('../middleware/paypalHelper');
const Vehicule = require('../models/Vehicule');
const User = require('../models/User');
const Historique = require('../models/Historique_transaction');

const PUBLISHABLE_KEY = "pk_test_51IlzGlJsvsf81CSo37sbixThf3GkryFfABqghuzEch9CiVv3TrnsHIZ7IYY5NhlQCq6L4t1QDDSW4WL8E7OZOIMU00XVsPWj0o";
const SECRET_KEY = "sk_test_51IlzGlJsvsf81CSo22Rq63CH9uQDbcAZjGcDW4QtIXIVQOEwXPzCIvPlQAvsJkh5CQblLdfR9r92pQZQTBvNIN9S00VbCsUcjd";

const stripe = require('stripe')(SECRET_KEY);

const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

const QRCode = require('qrcode');

// GET paiement by User
exports.getPaiement = async (req, res, next) => {
  userData = req.session.passport;

  // "6064ab585f194a098c13af36"

  let foundUserId = await User.findById({
    _id: userData.user
  });

  // let foundVehiculeUser = await Vehicule.find({ idUser: foundUserId});

  await Historique.find({idUser: foundUserId}).then(async (result)=>{
    res.status(200).render('paiement/paiement', { result: result});
  }).catch((error)=>{
    res.status(500).json({
      message : "Error occured on get Paiement",
      error: error
    });

  });

}

// GET only 5 transaction

exports.getRecentTransaction = async (req, res, next) => {
  userData = req.session.passport;

  await Historique.find().sort('-createdAt').limit(5).exec(async function (err, user) {
    if (err) {
        res.status(500).send(err)
    } else {
      const vehicule = await Vehicule.find({idUser: userData._id});
      console.log("vehicule in profile ", vehicule);
      res.status(200).render('auth/profile', { result: result, car: vehicule});
    }
  })

}

// get vignette info
exports.vignette = async (req, res, next) =>{

  userData = req.session.passport;

  let foundUserId = await User.findById({
    _id: req.user._id
  });

  var vehicules = await Vehicule.find({idUser: req.user._id});

  await Historique.find().
  populate("Vehicule", {num_plaque:1, _id:0}).sort('-createdAt').exec((err, vehicule)=>{
    if(err){
      res.status(500).send(err);
    }else{
      //const vehicule = await Vehicule.find({num_plaque: })
      res.status(200).render('auth/vignette', { result: vehicule, vehicules: vehicules});
    }
  });

/*

  await Historique.findOne({num_plaque: foundUserId._id}).sort('-createdAt').exec(async function (err, user) {
    if (err) {
        console.log(err.message);
        res.status(500).send(err)
    } else {
      

    }

    // res.status(200).render('auth/vignette', { result: user, image: text, users: foundUserId});

  })

*/


}

/** STRIPE Paiement **/
/*
exports.stripePaiement = async (req, res, next) =>{

  userData = req.session.passport;
  let foundUserId = await User.findById({
    _id: req.user._id
  });

  stringPrix = ""+ req.body.prix + "00";

  let vehicule = await Vehicule.find({ idUser: foundUserId });

  stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken,
    name: `${foundUserId.prenom} ${foundUserId.nom} ${foundUserId.postnom}`,
    address:{
      postal_code: "100",
      city: "Kinshasa",
      state: "Kinshasa",
      country: "RDC"
    }
  })
  .then((customer) =>{
    // console.log("customer debut", customer);
    return stripe.charges.create({
      amount: parseFloat(stringPrix),
      description: 'Paiement Vignette',
      currency: 'USD',
      customer: customer.id
    });

  })
  .then((charge) =>{
    console.log("My charge ", charge);

    let amount = "" + charge.amount;

    let val = amount.substring(0, 2);

    console.log("La val ", val);

    const insertPayment = new Historique({
      idUser: userData,
      idVehicule: data.clientData._id,
      num_plaque: data.clientData.num_plaque,
      currency: "USD",
      cout: parseFloat(val),
      refPaiement: charge.id,
      date_paiement: new Date(charge.created).toLocaleString,
      statut: charge.status						
    });

    res.redirect('http://localhost:3000/paiement/vignette');
  })
  .catch((err) =>{
    console.log("My error ", err);
    res.redirect('home');
  })

}
*/

/** END STRIPE Paiement **/


/** PAYPAL Paiement  **/

// POST Add Payement
exports.paynow = async (req, res, next) => {
  userData = req.session.passport;
  let foundUserId = await User.findById({
    _id: req.user._id
  });

  let vehicule = await Vehicule.find({ idUser: foundUserId });

  console.log("notre body paynow ", req.body);

  const data = {
    userID: userData.user,
    data: req.body
  }
  console.log(data);

  helper.payNow(data, function (error, result) {

    console.log("data from paynow ", data);

    if (error) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(JSON.stringify(error));
    } else {
      userData.paypalData = result;
      console.log("User paypal data in paynow ", userData.paypalData);
      userData.clientData = req.body;
      console.log("Client data from paynow ", userData.clientData)
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
      res.redirect('https://vignette-new-app.herokuapp.com/paiement/vignette');
    });
  }

}

/*
  res.render('paiement/paiement', {
        response: response
      });
*/

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

/** END PAYPAL Paiement **/


// console.log("my text qr ", text);

/*

const imageFile = await QRCode.toDataURL(text);
mkdirp('public/qr_image/' + user._id, function (err) {
          return console.log(err);
});

mkdirp('public/qr_image/' + user._id + '/qrcode', function (err) {
          return console.log(err);
});

*/

// var qrImage = req.files.pic;

 /*
          qrImage.mv(path, function (err) {
            return console.log(err);
          });
*/
        
/*
        for(i=0; i <= user.length; i++){
          text += "\n" + user[i].num_plaque + "\n" +
           user[i].cout + "\n" + user[i].refPaiement + "\n" + user[i].date_paiement;
        }
*/

// QRCode function
/*
async function generateQR (user, text){
  try {

    const qrimage = await QRCode.toFile(`${user._id}.png`, text);

    mkdirp('public/qr_images/' + user._id, function (err) {
      return console.log(err);
    });

    mkdirp('public/qr_images/' + user._id + '/qr', function (err) {
      return console.log(err);
    });

    var qrCodeImage = req.files.pic;
    var path = 'public/qr_images/' + user._id + '/' + qrimage;

    console.log(path);
        
    qrCodeImage.mv(path, function (err) {
      return console.log(err);
    });

    console.log( await QRCode.toString(text, {type: 'terminal'}) );

  } catch (error) {
    console.log(error);
  }

}
*/

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
