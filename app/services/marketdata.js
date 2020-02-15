/*!
 * Module dependencies.
 */

const axios = require("axios")

var is_created = false;

const BINANCE_PRICE_CODE_HASH = '6b7be61b150aec5eb853afb3b53e41438959554580d31259a1095e51645bcd28';
const ASSETS = ['ETH', 'BTC']
const ASSET_PRICE = {
    JFIN: 1.5,
    ETH: 8821.8,
    BTC: 320152.18,
}

const ASSET_MULTIPLIER = {
    JFIN: 0.5,
    ETH: 0.7,
    BTC: 0.8
}

function init() {
    if (is_created) return;
    is_created = true;

    console.log("FETCH")
    ASSETS.forEach(asset => {
        // console.log(asset)
        requestBandProtocol({ "crypto_symbol": asset }, BINANCE_PRICE_CODE_HASH)
            .then(price_in_usd => {
                ASSET_PRICE[asset] = price_in_usd * 31;
                console.log(ASSET_PRICE)
            }).catch(resp => console.error("Error"))
    })
    setInterval(() => {
        console.log("FETCH")
        ASSETS.forEach(asset => {
            // console.log(asset)
            requestBandProtocol({ "crypto_symbol": asset }, BINANCE_PRICE_CODE_HASH)
                .then(price_in_usd => {
                    ASSET_PRICE[asset] = price_in_usd * 31;
                    console.log(ASSET_PRICE)
                }).catch(resp => console.error("Error"))
        })
    }, 60000);

};


function requestBandProtocol(params, codeHash) {
    return axios.post("http://rpc.alpha.bandchain.org/bandsv/request", {
        type: "FULL",
        params,
        codeHash
    }).then(result => {
        const data = result.data.proof.jsonProof.oracleDataProof.data;
        const resHex = data.substring(0, 16);
        return parseInt("0x" + resHex) / 100.0;
    })
}

exports.getPrice = function (asset) {
    init()
    return ASSET_PRICE[asset];
}
exports.calculateTHBCollateralAmount = function (asset, amount) {
    init()
    return ASSET_PRICE[asset] * amount * ASSET_MULTIPLIER[asset];
}

exports.calculateNeededAssetAmount = function (asset, thbCollateralAmount) {
    init()
    return thbCollateralAmount / ASSET_PRICE[asset] / ASSET_MULTIPLIER[asset];
}