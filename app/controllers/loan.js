/*!
 * Module dependencies.
 */
const loanStore = require('../stores/loan-store');
const userStore = require('../stores/user-store');
const marketdataSvc = require('../services/marketdata')

function calculateCollateralInTHBAmount(asset, amount) {
    return marketdataSvc.calculateTHBCollateralAmount(asset, amount)
}
function calculateCollateralUserPayoutRatio(loan) {
    const ratio = {};
    loan.collaterals.forEach(collateral => {
        if (!ratio[collateral.user_id]) {
            ratio[collateral.user_id] = 0;
        }
        ratio[collateral.user_id] += collateral.thb_amount / loan.total_collateral_amount;
    });
    console.log(ratio)
    return ratio;
}
exports.create = function (app) {
    app.post('/api/loans', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        var loan = {
            user_id: user.id,
            amount: req.body.amount,
            total_collateral_amount: 0,
            duration: req.body.duration,
            interest_rate: req.body.interest_rate,
            paid_amount: 0,
            collaterals: [],
        };
        loan = loanStore.add(loan);

        if (loan) {
            res.status(201).json(loan);
        } else {
            res.status(400).json({
                error: "bad request"
            })
        }
    })
    app.get('/api/loans/:id', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        const loan = loanStore.get(req.params.id);
        if (loan) {
            res.status(200).json(loan);
        } else {
            res.status(404).json({ error: "not found" })
        }
    })
    app.get('/api/loans', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        res.status(200).json(loanStore.list());
    })

    app.post('/api/loans/:id/collaterals', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        let loan = loanStore.get(req.params.id);
        if (loan) {
            var thbAmount = calculateCollateralInTHBAmount(req.body.asset, req.body.amount)
            var collateral = {
                user_id: user.id,
                asset: req.body.asset,
                amount: req.body.amount,
                thb_amount: thbAmount,
                status: "deposited"
            }
            loan.total_collateral_amount = loan.total_collateral_amount + thbAmount
            loan.collaterals.push(collateral)
            if (loanStore.update(loan.id, loan)) {
                res.status(200).json(loan);
            } else {
                res.status(500).json({ error: "internal server error" })
            }
        } else {
            res.status(404).json({ error: "not found" })
        }
    })

    app.get('/api/loans/:id/collaterals', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        const loan = loanStore.get(req.params.id);
        if (loan) {
            res.status(200).json(loan.collaterals)
        } else {
            res.status(404).json({ error: "not found" })
        }
    })


    app.post('/api/loans/:id/submit', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        const loan = loanStore.get(req.params.id);
        if (loan) {
            if (loan.total_collateral_amount >= loan.amount) {
                loan.status = "loaned";
                loanStore.update(loan.id, loan)
                res.status(200).json(loan);
            } else {
                res.status(403).json({
                    error: "insufficient collateral amount"
                });
            }

        } else {
            res.status(404).json({ error: "not found" })
        }
    })
    app.post('/api/loans/:id/pay', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)
        const loan = loanStore.get(req.params.id);
        if (loan && loan.status === "loaned") {

            const payAmount = req.body.amount;
            const interestAmount = payAmount - (payAmount / (1 + loan.interest_rate))
            loan.paid_amount += payAmount;
            const ratio = calculateCollateralUserPayoutRatio(loan)
            Object.keys(ratio).forEach(user_id => {
                const user = userStore.get(user_id)
                user.amount += interestAmount * ratio[user_id]
                userStore.update(user_id, user)
            })
            if (loan.paid_amount >= loan.amount) {
                loan.status = "paid";
                loan.collaterals.forEach(collateral => {
                    const user = userStore.get(collateral.user_id)
                    if (!user.assets[collateral.asset]) {
                        user.assets[collateral.asset] = 0;
                    }
                    user.assets[collateral.asset] += collateral.amount
                    userStore.update(user.id, user)
                })
            }
            loanStore.update(loan.id, loan)

            res.status(200).json(loan);
        } else {
            res.status(404).json({ error: "not found" })
        }
    })
};
