/*!
 * Module dependencies.
 */

const Expo = require('expo-server-sdk').Expo;
const loanStore = require('../stores/loan-store');
const collateralStore = require('../stores/collateral-store');
const userStore = require('../stores/user-store');
const marketdataSvc = require('../services/marketdata')

let expo = new Expo();
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

function sendNotification(pushToken, body, data) {
    // Create the messages that you want to send to clents
    let messages = [];

    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications)
    messages.push({
        to: pushToken,
        sound: 'default',
        body, //: 'This is a test notification',
        data //: { withSome: 'data' },
    })

    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
            } catch (error) {
                console.error(error);
            }
        }
    })();
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

    app.post('/api/loans/:id/collaterals/:collateral_id', (req, res) => {
        const user = userStore.getOrCreateUserByUsername(req.headers.username)

        let loan = loanStore.get(req.params.id);
        const loanUser = userStore.get(loan.user_id)
        console.log(loanUser)
        let collateral = collateralStore.get(req.params.collateral_id)
        if (loan && collateral) {

            if (collateral.status === "deposited") {
                loan.total_collateral_amount = loan.total_collateral_amount + collateral.thb_amount
                loan.collaterals.push(collateral)
                if (loanStore.update(loan.id, loan)) {
                    if (loan.total_collateral_amount >= loan.amount) {
                        sendNotification(
                            "ExponentPushToken[g7pYxFAB8eJ3FFX1fiwH8c]"/*loanUser.expo_push_token*/,
                            "ยินดีด้วย เงินกู้ได้รับการอนุมัติ เนื่องจากคุณได้รับสินทรัพย์ค้ำประกันครบแล้ว", {
                            loan_id: loan.id
                        })
                    }
                    res.status(200).json(loan);
                } else {
                    res.status(500).json({ error: "internal server error" })
                }
            } else {
                res.status(403).json({ error: "collateral not yet deposited" })
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
