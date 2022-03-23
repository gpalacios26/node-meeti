const Usuarios = require('../../models/Usuarios');
const Grupos = require('../../models/Grupos');

const mostrarUsuario = async (req, res, next) => {
    const consultas = [];
    consultas.push(Usuarios.findOne({ where: { id: req.params.id } }));
    consultas.push(Grupos.findAll({ where: { usuarioId: req.params.id } }));

    const [usuario, grupos] = await Promise.all(consultas);

    if (!usuario) {
        res.redirect('/');
        return next();
    }

    res.render('mostrar-perfil', {
        nombrePagina: `Perfil Usuario: ${usuario.nombre}`,
        usuario,
        grupos
    });
};

module.exports = {
    mostrarUsuario
}