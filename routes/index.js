const express = require('express');
const router = express.Router();
const auth = require('../config/auth');

const PUBLISHABLE_KEY = "pk_test_51IlzGlJsvsf81CSo37sbixThf3GkryFfABqghuzEch9CiVv3TrnsHIZ7IYY5NhlQCq6L4t1QDDSW4WL8E7OZOIMU00XVsPWj0o";

const Vehicule = require('../models/Vehicule');
const User = require('../models/User');


router.get('/home', auth.ensureAuthenticated,  async (req, res)=>{

    let foundUserId = await User.findById({
        _id: req.user._id
    });

    console.log(foundUserId);

    await Vehicule.find({ idUser: foundUserId}).then((result) =>{

        res.status(200).render('auth/index', {
            result: result
        });

    }).catch((error)=>{
        res.status(500).json({
            message : "Error occured on get vehicule by user",
            error: error
        });
    });
    
});

module.exports = router;