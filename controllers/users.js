const User = require('../models/user');

module.exports.renderRegister = (req,res) => {
    res.render('users/register')
}


module.exports.register = async (req,res) => {
    try {
    const {email, username, password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    //req.login logs user in straight after they have registered
    req.login(registeredUser, err => {
        if(err) return next(err);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    });
    } catch(e) {
        req.flash('error',e.message);
        res.redirect('register');
    }
}


module.exports.renderLogin = (req,res) => {
    res.render('users/login');
}

module.exports.login = (req,res) => {
    req.flash('success', 'Welcome back');
    // looks for the url a user was trying to access before being redirected to login first. If no redirect then go to /campgrounds
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    //then delete the url from the session
    delete res.locals.returnTo;
    res.redirect(redirectUrl);
}


module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}