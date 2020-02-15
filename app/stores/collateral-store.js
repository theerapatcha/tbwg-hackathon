var collaterals = {};
var id = 1;
exports.list = function () {
    return Object.keys(collaterals).map(function (key) { return collaterals[key]; });
}

exports.get = function (id) {
    return collaterals[parseInt(id + "")];
}
exports.add = function (collateral) {
    collateral.id = id++;
    collaterals[collateral.id] = collateral
    return collateral;

}
exports.update = function (id, collateral) {
    if (!collaterals[collateral.id]) {
        return undefined;
    }
    collaterals[parseInt(id + "")] = collateral
    return collateral;
}

