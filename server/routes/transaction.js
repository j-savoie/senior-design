const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const {verifyJWT} = require('../middleware/auth');
const Employee = require('../models/Employee');
const Till = require('../models/Till');
const Item = require('../models/Item');


/**
 * Create a transaction from passed in info
 *
 * @route POST /transaction/create
 * @expects JWT in header of request, employeeId, [itemIds], & price in JSON in body of request
 * @success 201 Created, returns {formattedTransaction, code}
 * @error 400 Bad Request, No Request Body passed
 *        400 Bad Request, Type1: ObjectId is not 12 bytes
 *        400 Bad Request, Type2: ObjectId is not valid
 *        400 Bad Request, Invalid X input 
 *        401 Unauthorized, Invalid Token
 *        404 Not Found, X not found
 *        500 Internal Server Error
 */
router.post('/create', verifyJWT, async function(req, res){
    //check if req body exists
    if(!req.body) return res.status(400).send({err: 'No request body', code: 400});

    //Verify input
    if(typeof req.body.employeeId === 'undefined' || !req.body.employeeId) return res.status(400).send({err: 'Invald employeeId input', code: 400});
    if(typeof req.body.items === 'undefined' || !req.body.items || req.body.items.length === 0) return res.status(400).send({err: 'Invald items input', code: 400});
    if(typeof req.body.price === 'undefined' || !req.body.price) return res.status(400).send({err: 'Invald price input', code: 400});
    if(typeof req.body.tillId === 'undefined' || !req.body.tillId) return res.status(400).send({err: 'Invald tillId input', code: 400});

    //Verify ObjectIds are valid
    if(!(mongoose.isValidObjectId(req.body.employeeId)) || !(mongoose.isValidObjectId(req.body.tillId))) return res.status(400).send({err: 'Type 1: Id is not a valid ObjectId', code: 400});
    if(!((String)(new ObjectId(req.body.employeeId)) === req.body.employeeId) || !((String)(new ObjectId(req.body.tillId)) === req.body.tillId)) return res.status(400).send({err: 'Type 2: Id is not a valid ObjectId', code: 400});
    for(let item of req.body.items){
        if(!(mongoose.isValidObjectId(item.id))) return res.status(400).send({err: 'Type 1: Id is not a valid ObjectId', code: 400});
        if(!((String)(new ObjectId(item.id)) === item.id)) return res.status(400).send({err: 'Type 2: Id is not a valid ObjectId', code: 400});
    }

    //Create temp new transaction
    let newTransaction = new Transaction({
        employeeId: req.body.employeeId,
        items: req.body.items,
        price: req.body.price,
        date: new Date()
    });
    let tillId = req.body.tillId;

    //Verify Till exists
    Till.findById(tillId, function(err, till){
        if(err){
            console.log(err);
            return res.status(500).send({err: 'Internal Server Error', code: 500});
        }
        if(!till) return res.status(404).send({err: `Till not found`, code: 404});

        //Verify Employee exists & is apart of the Till
        Employee.findById(newTransaction.employeeId, function(err, employee){
            if(err){
                console.log(err);
                return res.status(500).send({err: 'Internal Server Error', code: 500});
            }
            if(!employee) return res.status(404).send({err: `Employee not found`, code: 404});
            if(!till.employees.includes(employee.email)) return res.status(401).send({err: `Unauthorized to create Transactions for Till`, code: 401});
        });

        //Verify Items exist
        for(let item of newTransaction.items){
            if(!item.id || item.quantity === 0) return res.status(400).send({err: `Invalid item ID or quantity for ${item}`, code: 400});
            Item.findById(item.id, function(err, item){
                if(err){
                    console.log(err);
                    return res.status(500).send({err: 'Internal Server Error', code: 500});
                }
                if(!item) return res.status(404).send({err: `Item not found`, code: 404});
            });
        }

        //Attempt to save Transaction
        newTransaction.save(function(err, transaction) {
            if(err) {
                console.log(err);
                return res.status(500).send({err: 'Internal Server Error', code: 500});
            } else {
                let formattedTransaction = {
                    id: transaction._id.toString(),
                    employeeId: transaction.employeeId,
                    price: transaction.price,
                    date: transaction.date,
                    items: transaction.items
                };

                //Attempts to update till to include the new transaction
                till.transactions.push(new ObjectId(formattedTransaction.id));
                till.save(function(err, updatedTill){
                    if(err) {
                        console.log(err);
                        return res.status(500).send({err: 'Internal Server Error', code: 500});
                    }
                });
                return res.status(201).send({formattedTransaction, code: 201});
            }
        });
    });
});


/**
 * Get a transaction from passed in info
 *
 * @route POST /transaction/get
 * @expects JWT in header of request, transactionId in JSON in body of request
 * @success 201 Created, returns {formattedTransaction, code}
 * @error 400 Bad Request, No Request Body passed
 *        400 Bad Request, Type1: ObjectId is not 12 bytes
 *        400 Bad Request, Type2: ObjectId is not valid
 *        400 Bad Request, Invalid X input 
 *        401 Unauthorized, Invalid Token
 *        404 Not Found, X not found
 *        500 Internal Server Error
 */
router.post('/get', verifyJWT, async function(req, res){
    //check if req body exists
    if(!req.body) return res.status(400).send({err: 'No request body', code: 400});

    //Verify input
    if(typeof req.body.transactionId === 'undefined' || !req.body.transactionId) return res.status(400).send({err: 'Invald transaction input', code: 400});

    //verify ObjectId are valid
    if(!(mongoose.isValidObjectId(req.body.transactionId))) return res.status(400).send({err: 'Type 1: Id is not a valid ObjectId', code: 400});
    if(!((String)(new ObjectId(req.body.transactionId)) === req.body.transactionId)) return res.status(400).send({err: 'Type 2: Id is not a valid ObjectId', code: 400});
    
    //Store Id
    let transactionId = req.body.transactionId;

    //get Transaction
    Transaction.findById(transactionId, async function(err, transaction){
        if(err){
            console.log(err);
            return res.status(500).send({err: 'Internal Server Error', code: 500});
        }
        if(!transaction) return res.status(404).send({err: `Transaction not found`, code: 404});
        let formattedTransaction = {
            id: transaction._id.toString()
        }

        Employee.findById(transaction.employeeId, function(err, employee){
            if(err){
                console.log(err);
                return res.status(500).send({err: 'Internal Server Error', code: 500});
            }
            if(!employee) return res.status(404).send({err: `Employee not found`, code: 404});
            formattedTransaction.employee = {
                id: employee._id.toString(),
                email: employee.email,
                isManager: employee.isManager
            }
        });

        let items = [];
        for(let item of transaction.items){
            if(!item.id || item.quantity === 0) return res.status(400).send({err: `Invalid item ID or quantity for ${item}`, code: 400});
            await Item.findById(item.id, function(err, foundItem){
                if(err){
                    console.log(err);
                    return res.status(500).send({err: 'Internal Server Error', code: 500});
                }
                if(!foundItem) return res.status(404).send({err: `Item not found`, code: 404});
                items.push({
                    id: foundItem._id.toString(),
                    price: foundItem.price,
                    name: foundItem.name,
                    quantity: item.quantity
                });
            }).clone();
        }
        formattedTransaction.items = items;
        formattedTransaction.date = transaction.date.toString();
        return res.status(200).send({formattedTransaction, code: 200});
    });
});

module.exports = router;