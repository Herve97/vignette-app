const express = require('express');
const router = express.Router();
const auth = require('../config/auth');

const Vehicule = require('../models/Vehicule');
const User = require('../models/User');

router.get('/home', auth.ensureAuthenticated, async function(req, res){

    let foundUserId = await User.findById({
        _id: req.user._id
    });
    // console.log(foundUserId);
    await Vehicule.find({ idUser: foundUserId}).then((result) =>{
        res.status(200).render('index', { result: result});
        //res.render('index', {template: "home"});
    }).catch((error)=>{
        res.status(500).json({
            message : "Error occured on get vehicule by user",
            error: error
        });
    });

    // let dt = new Date().toLocaleDateString()
    
});

module.exports = router;