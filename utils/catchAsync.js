module.exports = func => {
    return (req, res, next) => {
        // console.log("Hitting");
        func(req, res, next).catch(next);
    }
}