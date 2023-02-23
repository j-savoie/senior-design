const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const User = require('../models/User');
const verifyJWT = require('../middleware/auth');

/*
    * DONE (at least for now)  
    Gets a business based on the businesses name
*/
router.post('/get', verifyJWT, async function(req, res){
    //Check if there is a body in the request
    //if(!req.body) return res.status(400).send({err: 'No request body', code: 400});
    
    let user = await User.findOne({email: req.user.email}).exec().catch( err => {return res.status(500).send({err: 'Error finding user from jwt', code: 500})});
    if(user === null) return res.status(403).send({err: 'User does not exist', code: 403});

    //Find the business then format it and return
    let name = req.body.name;
    Business.findOne({ownerId: user._id}, function(err, business){
        if(err){
            console.log(err);
            return res.status(500).send({err: 'Unable to get business', code: 500});
        } else {
            //If business is not found
            if(business === null) return res.status(404).send({err: `Business with ${name} does not exist`, code: 404});
            let formattedBus = {
                id: business._id,
                name: business.name,
                ownerId: business.ownerId,
                type: business.type,
                admins: business.admins,
                tills: business.tills
            };
            return res.status(201).send({formattedBus, code: 201});
        }
    })
});

/** 
 * TODO: check that it's proper code numbers, check proper comment format, and make pop-up if business name is duplicate
    Edits a business's name and type
*/
router.post('/edit', verifyJWT, async function(req, res) {
    //Check if there is a body in the request
    //if(!req.body) return res.status(400).send({err: 'No request body', code: 400});
    
    let user = await User.findOne({email: req.user.email}).exec().catch( err => {return res.status(500).send({err: 'Internal server error.', code: 500})});
    if(user === null) return res.status(404).send({err: 'User does not exist', code: 404});

    //Find the business then format it and return
    let name = req.body.name;
    Business.findOne({ownerId: user._id}, async function(err, business){
        if(err){
            console.log(err);
            return res.status(500).send({err: 'Internal server error.', code: 500});
        } else {
            //If business is not found
            if(business === null) return res.status(404).send({err: `Business with ${name} does not exist`, code: 404});

            //Check if a business with the same name exists
            let findBusinessDup = await Business.findOne({name: req.body.name}).exec().catch( err => {return res.status(500).send({err: 'Internal server error.', code: 500})});
            if(findBusinessDup !== null) return res.status(403).send({err: 'Business already exists', code: 403});

            //create updatedBus???
            business.name = req.body.name;
            business.type = req.body.type;
            business.save(function(err, updatedBusiness) {
                if(err) {
                    console.log(err);
                    return res.status(500).send({err: 'Internal server error.', code: 500});
                }
                return res.status(200).send({updatedBusiness, code: 200});
            });
        }
    })
});

/*
    * DONE
    Posts a business & links it to a user
*/
router.post('/create', verifyJWT, async (req, res) => {
    //Check if there is a body in the request
    if(!req.body) return res.status(400).send({err: 'No request body'});

    //Check if a user exist & if they have a businessId assigned to them
    let user = await User.findOne({email: req.user.email}).exec().catch( err => {return res.status(500).send({err: 'Error finding user from jwt', code: 500})});
    if(user === null) return res.status(403).send({err: 'User does not exist', code: 403});
    if(user.businessId !== null) return res.status(403).send({err: 'User has a business ID', code: 403});

    //Create temp new business
    let new_business = new Business({
        name: req.body.name,
        ownerId: user._id,
        type: req.body.type,
        admins: req.body.admins,
        tills: req.body.tills
    });

    //Check if a business with the same name exists
    let findBusinessDup = await Business.findOne({name: req.body.name}).exec();
    if(findBusinessDup !== null) return res.status(403).send({err: 'Business already exists', code: 403});

    //Attempt to save the business
    new_business.save(function(err, business) {
        if(err) {
            console.log(err);
            return res.status(500).send({err: 'Error saving Business', code: 403});
        }
        let formattedBus = {
            id: business._id,
            name: business.name,
            ownerId: business.ownerId,
            type: business.type,
            admins: business.admins,
            tills: business.tills
        };
        //Update owner to inlcude the businessId
        user.businessId = formattedBus.id;
        user.save(function(err, owner){
            if(err) {
                console.log(err);
                return res.status(500).send({err: 'Error updating user', code: 403});
            }
        });
        return res.status(201).send({formattedBus, code: 201});
    });
});

/*
    TODO: find a better way to check which users were not found, filter out users that are already admins for the business, & ensure
    * NOT WORKING 100%
    Modify a businesses' admins
*/
router.post('/admins', verifyJWT, async function(req, res){
    if(!req.body) return res.status(400).send({err: 'No request body'});

    //checks if the users exist
    let result = await User.find({ '_id': { $in: req.body.admins } });
    if(result.length != req.body.admins.length) return res.status(400).send({err: 'Unable to find admin(s)', code: 403});
    
    //checks if the admin to be added is already an admin of that business
    Business.findOne({name: req.body.name}, function(err, business){
        if(err){
            console.log(err);
        } else {
            req.body.admins.forEach(admin => {
                const index = business.admins.indexOf(admin);
                if (index > -1) {
                    req.body.admins.splice(index, 1); // 2nd parameter means remove one item only
                }
            });
        }
    })

    //gets the business and adds the admins
    let update = await Business.findOneAndUpdate({name: req.body.name}, {$push: {admins: req.body.admins}}, { new: true });
    if(!update) return res.status(400).send({err: 'Unable to update businesses admins', code: 403});

    update.save(function(err, business) {
        if(err) {
            console.log(err);
            return res.status(500).send({err: 'Unable to update businesses admins', code: 500});
        }
        let formattedBus = {
            id: business._id,
            name: business.name,
            ownerId: business.ownerId,
            type: business.type,
            admins: business.admins,
            tills: business.tills
        };
        return res.status(201).send({formattedBus, code: 201});
    });
});

/*
   TODO 
    Modify a businesses' tills
*/
router.post('/edittills', verifyJWT, async function(req, res){
    if(!req.body) return res.status(400).send({err: 'No request body'});

    let find_business = await Business.findOne({email: req.body.name}).exec();
    if(find_business) return res.status(403).send({err: 'Business already exists', code: 403});
});

/*
   TODO 
    fetch a businesses' tills
*/
router.post('/tills', verifyJWT, async function(req, res){
    if(!req.body) return res.status(400).send({err: 'No request body'});

    let find_business = await Business.findOne({email: req.body.name}).exec();
    if(find_business) return res.status(403).send({err: 'Business already exists', code: 403});
});

module.exports = router;