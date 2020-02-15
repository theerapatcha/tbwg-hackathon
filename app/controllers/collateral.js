/*!
 * Module dependencies.
 */
const collateralStore = require('../stores/collateral-store');
const userStore = require('../stores/user-store');
const marketdataSvc = require('../services/marketdata')

function calculateCollateralInTHBAmount(asset, amount) {
    return marketdataSvc.calculateTHBCollateralAmount(asset, amount)
}

exports.create = function (app) {

    function runUntil(checkCondition, onSuccess, ms) {
        var timer = setInterval(f, ms);
        function f() {
            if (checkCondition()) {
                onSuccess();
                clearInterval(timer);
                return;
            }
        }
    }

    app.post('/api/collaterals', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        var thbAmount = calculateCollateralInTHBAmount(req.body.asset, req.body.amount)
        var collateral = {
            user_id: user.id,
            asset: req.body.asset,
            amount: req.body.amount,
            thb_amount: thbAmount,
            status: "waiting"
        }

        collateral = collateralStore.add(collateral);
        // put to network
        // intervally check on network
        runUntil(() => true, () => {
            collateral.status = "deposited";
            collateralStore.update(collateral.id, collateral)
        }, 1000)
        if (collateral) {
            res.status(201).json(collateral);
        } else {
            res.status(400).json({
                error: "bad request"
            })
        }
    })
    app.get('/api/collaterals/:id', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        const collateral = collateralStore.get(req.params.id);
        console.log(collateral)
        if (collateral) {
            res.status(200).json(collateral);
        } else {
            res.status(404).json({ error: "not found" })
        }
    })
};
