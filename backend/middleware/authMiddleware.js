//Helper Function for Authentication purposes
const isAuthenticated = (req, res, next) => {
    if(req.session.userId){
        next();
    } else {
        res.redirect('/login');
    }
};