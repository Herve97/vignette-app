const Vehicule = require('../models/Vehicule');
const User = require('../models/User');

const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

//Get Single Level
exports.getVehiculeByUser = async (req, res, next) => {

    let foundUserId = await User.findById({
        _id: req.user._id
    });
    // console.log(foundUserId);
    await Vehicule.find({ idUser: foundUserId}).then((result) =>{
        res.status(200).json(result);
        //res.render('index', {template: "home"});
    }).catch((error)=>{
        res.status(500).json({
            message : "Error occured on get vehicule by user",
            error: error
        });
    });
}

/*
  Post Level
*/

exports.postVehicule = async (req, res) => {

    if (!req.files) {
        imageFile = "";
    }

    if (req.files) {
        var imageFile = typeof req.files.pic !== "undefined" ? req.files.pic.name : "";
    }

    req.checkBody('pic', 'you must').isImage(imageFile);

    const vehiculeExist = await Vehicule.findOne({ num_plaque: req.body.num_plaque });

    const idUser = req.params.userId;   //"6064ab585f194a098c13af36"; 

    const { num_plaque, marque, modele, type, puissance, couleur, annee_fabrication, num_chassis } = req.body

    if (vehiculeExist) {
        res.status(400).json({ "error": 'Vehicule already Exist' });
    } else {
        const vehicule = new Vehicule({
            num_plaque: num_plaque.toUpperCase(),
            marque: marque.toUpperCase(),
            modele: modele.toUpperCase(),
            type: type.toUpperCase(),
            puissance: puissance.toUpperCase(),
            couleur: couleur.toUpperCase(),
            pic: imageFile,
            annee_fabrication: annee_fabrication,
            num_chassis: num_chassis.toUpperCase(),
            prix: puissance * 5
        });

        let foundUserId = await User.findById({
            _id: req.user._id
        });

        vehicule.idUser = foundUserId._id;

        try{
            const cars = await vehicule.save(

                function (err) {
                    if (err)
                        console.log(err)
                    //Add car and create uploads folder
                    mkdirp('public/car_images/' + vehicule.num_plaque, function (err) {
                        return console.log(err);
                    });
        
                    mkdirp('public/car_images/' + vehicule.num_plaque + '/car', function (err) {
                        return console.log(err);
                    });
        
                    if (imageFile != "") {
                        var vehiculeImage = req.files.pic;
                        var path = 'public/car_images/' + vehicule.num_plaque + '/' + imageFile;
        
                        vehiculeImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }
                    res.redirect('/home');
                    
                })
                

        } catch (err) {
            res.status(400).json({ 'error': err })
        }
       
    }
}

// GET add vehicule

exports.getAddVehicule = async (req, res, next) =>{
    res.render('auth/add_vehicule');
}


/*
* POST Edit pays
*/

exports.editVehicule = async (req, res, next) => {
    try {
        const update = req.body
        const id = req.params.id;
        await Vehicule.findByIdAndUpdate(id, update);
        const vehicule = await Vehicule.findById(id)
        res.status(200).json({
            vehicule: vehicule,
            message: 'Vehicule has been updated'
        });
    } catch (error) {
        next(error)
    }
}

/*
* GET delete skill 
*/

exports.deleteVehicule = async (req, res, next) => {
    await Vehicule.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            console.log(err);
        res.status(200).json({ 'success': 'Level delete' })

    });
}

/*
    await Vehicule.find({
        idUser: foundUserId
    }).then((result) => {
        res.status(200).render('index',{
            result: result,
            message: 'User Vehicule'
        });
    }).catch((error) => {
        res.status(400).json({ 'error': error })
    });
*/


/*
res.status(200).json({
                result: result,
                message: 'Vehicule has been created'
            });
*/
