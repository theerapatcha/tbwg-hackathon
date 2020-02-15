var loans = {};
var id = 1;
exports.list = function () {
    return Object.keys(loans).map(function (key) { return loans[key]; });
}

exports.get = function (id) {
    return loans[parseInt(id + "")];
}
exports.add = function (loan) {
    loan.id = id++;
    loans[loan.id] = loan
    return loan;

}
exports.update = function (id, loan) {
    if (!loans[loan.id]) {
        return undefined;
    }
    loans[parseInt(id + "")] = loan
    return loan;
}

