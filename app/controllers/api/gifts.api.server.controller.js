var gifts = require('../../models/gifts');
var giftsPerBiinie = require('../../models/giftsPerBiinie');
var utils = require('../utils.server.controller');
var organization = require('../../models/organization');
var _ = require('underscore');
var giftsStatus = require('../enums/giftstatusenum');
var notificationsManager = require('../notifications.server.controller');


/**
 *  Gifts calls for api
 */

exports.getGiftsList = function (req, res) {
    var orgID = req.params["identifier"];
    gifts.find({organizationIdentifier: orgID, isDeleted: false}, {}, function (err, giftsToSend) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(giftsToSend);
        }
    });
};

exports.createGift = function (req, res) {
    var newGift = new gifts();
    var orgID = req.params["identifier"];
    newGift.identifier = utils.getGUID();
    newGift.organizationIdentifier = orgID;
    newGift.save(function (err, gift) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(201).json(gift);
        }
    });
};

exports.updateGift = function (req, res) {
    var orgID = req.params["identifier"];
    var giftIdenfifier = req.params["giftidentifier"];
    var giftData = req.body;

    var set = {};
    for (var field in giftData) {
        set[field] = giftData[field];
    }

    gifts.findOneAndUpdate(
        {identifier: giftIdenfifier},
        {$set: set},
        {upsert: false, new: true},
        function (err, document) {
            if (err) {
                res.status(500).json(err);
            }
            else {
                res.status(200).json(document);
            }
        }
    );
};

exports.removeGift= function (req, res) {
    var giftIdentifier = req.params.giftidentifier;
    gifts.findOne({identifier: giftIdentifier}, {}, function (err, gift) {
        if (err) {
            res.status(500).json(err);
        } else {
            if (gift) {
                gift.isDeleted = true;
                gift.save(function (err) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(204).send();
                    }
                })
            } else {
                res.status(500).json({message: "gift not found"});
            }
        }
    });
};

exports.assignGift = function (req, res) {
    var biinieIdentifier = req.body.biinieIdentifier;
    var giftIdentifier = req.body.giftIdentifier;

    gifts.findOne({identifier: giftIdentifier}, {}, function (err, gift) {
        if (err)
            res.status(500).json(err);
        else {
            if (gift) {
                if (gift.amountSpent < gift.amount || gift.amount == -1) {

                    gift.amountSpent = gift.amountSpent + 1;

                    var newBiinieGift = new giftsPerBiinie();
                    newBiinieGift.gift = gift;
                    newBiinieGift.identifier = utils.getGUID();
                    newBiinieGift.biinieIdentifier = biinieIdentifier;
                    newBiinieGift.save(function (err) {
                        if (err)
                            res.status(500).json(err);
                        else
                            gift.save(function (err) {
                                if (err)
                                    res.status(500).json(err);
                                else {
                                    notificationsManager.sendToUser(biinieIdentifier, "Has obtenido un nuevo regalo", "Tienes un nuevo regalo en tu baul.").then(function () {
                                        res.status(200).json({});
                                    }).catch(function () {
                                        res.status(500).json({});
                                    });

                                }
                            });
                    });
                }
                else {
                    res.status(500).json({message: "Gift has reached its max amount of gifts allowed"});
                }
            } else {
                res.status(500).json({message: "There is no gift"});
            }

        }
    });
};

/**
 *  Gifts calls for mobile
 */