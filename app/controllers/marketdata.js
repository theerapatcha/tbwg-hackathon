/*!
 * Module dependencies.
 */

const axios = require("axios")
const marketdataSvc = require('../services/marketdata')

exports.create = function (app) {
    app.get('/api/marketdata/:asset/price', async (req, res) => {
        const asset = req.params.asset;
        const price = marketdataSvc.getPrice(asset);
        if (price) {
            res.status(201).json({
                asset,
                price: price
            });
        } else {
            res.status(404).json({
                error: "not found"
            });
        }
    })

    app.get('/api/marketdata/:asset/needed-amount/:thbAmount', async (req, res) => {
        const asset = req.params.asset;
        const amount = marketdataSvc.calculateNeededAssetAmount(asset, req.params.thbAmount);
        if (amount) {
            res.status(201).json({
                asset,
                amount: amount
            });
        } else {
            res.status(404).json({
                error: "not found"
            });
        }
    })
};
