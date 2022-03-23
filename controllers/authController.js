const passport = require('passport');

const autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

const usuarioAutenticado = (req, res, next) => {
    // Si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
    }

    // Si no esta autenticado
    return res.redirect('/iniciar-sesion');
};

const cerrarSesion = (req, res, next) => {
    req.logout();
    req.flash('correcto', 'Cerraste sesión correctamente');
    res.redirect('/iniciar-sesion');
    next();
};

module.exports = {
    autenticarUsuario,
    usuarioAutenticado,
    cerrarSesion
}