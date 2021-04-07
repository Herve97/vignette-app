const Vehicule = require('../models/Vehicule');
const User = require('../models/User');

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

exports.postVehicule = async (req, res, next) => {
    const vehiculeExist = await Vehicule.findOne({ num_plaque: req.body.num_plaque });

    const idUser = req.params.userId;

    const { num_plaque, marque, modele, type, puissance, couleur, annee_fabrication, num_chassis } = req.body

    if (vehiculeExist) {
        res.status(400).json({ "error": 'Vehicule already Exist' });
    } else {
        const vehicule = new Vehicule({
            num_plaque: num_plaque,
            marque: marque,
            modele: modele,
            type: type,
            puissance: puissance,
            couleur: couleur,
            annee_fabrication: Date.parse(annee_fabrication),
            num_chassis: num_chassis,
            prix: puissance * 5
        });

        let foundUserId = await User.findById({
            _id: req.user._id
        });

        vehicule.idUser = foundUserId._id;

        vehicule.save().then((result) => {
            res.redirect('/home');
        }).catch((error) => {
            res.status(400).json({ 'error': error })
        });
    }
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
