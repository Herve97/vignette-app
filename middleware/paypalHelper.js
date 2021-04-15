const paypal = require('paypal-rest-sdk');
const Historique = require('../models/Historique_transaction');

// paypal auth configuration
/*
var config = {
	"port" : 5000,
	"api" : {
		"host" : "api.sandbox.paypal.com",
		"port" : "",            
		"client_id" : "AQrVUYKYTX4N4KGPie02y7JazAsIXYeWdUJjta0aq-RXX8Ihbx_KgEkuMNYp-CpHjMwKytPfi6wsLgEl",  // your paypal application client id
		"client_secret" : "EH4O_frRdGe3YpbwK52zmgOFLPL_X43vZTZDRKD8Z7ueB28BJjE6dmqJ4LDTcQkdknG30SB5cPkw4Cr6" // your paypal application secret id
	}
}
*/
paypal.configure({
	'mode': 'sandbox',
	'client_id': 'AQrVUYKYTX4N4KGPie02y7JazAsIXYeWdUJjta0aq-RXX8Ihbx_KgEkuMNYp-CpHjMwKytPfi6wsLgEl',
	'client_secret': 'EH4O_frRdGe3YpbwK52zmgOFLPL_X43vZTZDRKD8Z7ueB28BJjE6dmqJ4LDTcQkdknG30SB5cPkw4Cr6'
});

const self = {
	insertPayment: async function (data, callback) {
		var response = {};
		const payement = new Historique({
			idUser: data.idUser,
			idVehicule: data._id,
			num_plaque: data.num_plaque,
			currency: data.currency,
			cout: data.cout,
			refPaiement: data.refPaiement,
			date_paiement: data.date_paiement,
			statut: data.statut
		});

		payement.save(function (err, result) {
			if (err) {
				response.isPayementAdded = false;
				response.message = "Something went wrong, try after sometime";
			} else {
				response.isPayementAdded = true;
				response._id
				response.message = "Payement added";
			}
			callback(response);
		});
	},

	payNow: function (paymentData, callback) {
		var response = {};

		console.log(paymentData.data.prix);

		/* Creating Payment JSON for Paypal starts */
		const payment = {
			"intent": "authorize",
			"payer": {
				"payment_method": "paypal"
			},
			"redirect_urls": {
				"return_url": "https://vignette-new-app.herokuapp.com/paiement/execute",
				"cancel_url": "https://vignette-new-app.herokuapp.com/paiement/cancel"
			},
			"transactions": [{
				"amount": {
					"total": paymentData.data.prix,
					"currency": "USD"
				},
				"description": "Payement vignette pour le vehicule " + paymentData.data.num_plaque
			}]
		};
		/* Creating Payment JSON for Paypal ends */

		/* Creating Paypal Payment for Paypal starts */
		paypal.payment.create(payment, function (error, payment) {
			if (error) {
				console.log(error);
			} else {
				if (payment.payer.payment_method === 'paypal') {
					response.paymentId = payment.id;
					var redirectUrl;
					response.payment = payment;
					for (var i = 0; i < payment.links.length; i++) {
						var link = payment.links[i];
						if (link.method === 'REDIRECT') {
							redirectUrl = link.href;
						}
					}
					response.redirectUrl = redirectUrl;
				}
			}

			/* 
			* Sending Back Paypal Payment response 
			*/
			callback(error, response);
		});
		/* Creating Paypal Payment for Paypal ends */
	},
	getResponse: function (data, PayerID, callback) {

		var response = {};

		const serverAmount = parseFloat(data.paypalData.payment.transactions[0].amount.total);
		const clientAmount = parseFloat(data.clientData.prix);
		const paymentId = data.paypalData.paymentId;
		const details = {
			"payer_id": PayerID
		};

		response.userData = {
			user: data.user
		};

		console.log("userData response " + JSON.stringify(response.userData));

		console.log("Server Amount: " + serverAmount);
		console.log("Client Amount: " + clientAmount);

		if (serverAmount !== clientAmount) {
			response.error = true;
			response.message = "Payment amount doesn't matched.";
			callback(response);
		} else {

			paypal.payment.execute(paymentId, details, function (error, payment) {
				if (error) {
					console.log(error);
					response.error = false;
					response.message = "Payment Successful.";
					callback(response);
				} else {

					/*
					* inserting paypal Payment in DB
					*/

					const insertPayment = new Historique({
						idUser: data.user,
						idVehicule: data.clientData._id,
						num_plaque: data.clientData.num_plaque,
						currency: "USD",
						cout: serverAmount,
						refPaiement: paymentId,
						date_paiement: data.paypalData.payment.create_time,
						statut: data.paypalData.payment.state						
					});

					console.log("insert payment data avant insertion \n", JSON.stringify(insertPayment));

					insertPayment.save((err, result) => {
						if(err){
							throw err;
						}else {
							console.log("Resultat final ", result);
							response.message = "Payment Successful.";
							callback(response);
						}
					});

				};

			});

		};

	}
}
module.exports = self;

/*
self.insertPayment(insertPayment, function (result) {
						console.log("Le result de insert payement \n", result);
						if (!result.isPaymentAdded) {
							response.error = true;
							response.message = "Payment Successful, but not stored.";
							console.log("Payement non fait");
							console.log("isPaymentadded: ", result.isPaymentAdded);
							callback(response);
						} else {
							response.error = false;
							response.message = "Payment Successful.";
							console.log("Paiement effectué");
							callback(response);
						}

					});
*/

/*
	getVehiculeInfo:function(data,callback){
		var response={};
		Mongodb.onConnect(function(db,ObjectID){
			data._id = new ObjectID(data._id);
			db.collection('products').findOne(data,function(err, result){

				if(result != null ){
					response.error = false;
					response.data = result;
				}else{
					response.error = true;
				}
				callback(response);
			});
		});
	},
	getAllVehicule:function(data,callback){
		Mongodb.onConnect(function(db,ObjectID){
			db.collection('products').find().toArray(function(err, result){
				callback(result);
				db.close();
			});
		});
	},
*/

/*
,nom : data.sessionData.nom
*/


