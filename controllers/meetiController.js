const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const uuid = require('uuid/v4');

const formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id } });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    });
};

const sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();
};

const crearMeti = async (req, res) => {
    // Obtener los datos
    const meeti = req.body;

    // Asignar el usuario
    meeti.usuarioId = req.user.id;

    // Almacena la ubicación
    meeti.latitud = parseFloat(req.body.lat);
    meeti.longitud = parseFloat(req.body.lng);

    // Cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    meeti.id = uuid();

    // Almacenar en la BD
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        // Extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
};

const formEditarMeeti = async (req, res, next) => {
    const consultas = [];
    consultas.push(Grupos.findAll({ where: { usuarioId: req.user.id } }));
    consultas.push(Meeti.findByPk(req.params.id));

    const [grupos, meeti] = await Promise.all(consultas);

    if (!grupos || !meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti : ${meeti.titulo}`,
        grupos,
        meeti
    });
};

const editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if (!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // Asignar los valores
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    // Almacena la ubicación
    meeti.latitud = parseFloat(lat);
    meeti.longitud = parseFloat(lng);

    // Almacenar en la BD
    try {
        await meeti.save();
        req.flash('exito', 'Cambios Guardados Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        // Extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect(`/editar-meeti/${req.params.id}`);
    }
};

const formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if (!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti : ${meeti.titulo}`
    });
};

const eliminarMeeti = async (req, res) => {
    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    });

    req.flash('exito', 'Meeti Eliminado');
    res.redirect('/administracion');
};

module.exports = {
    formNuevoMeeti,
    sanitizarMeeti,
    crearMeti,
    formEditarMeeti,
    editarMeeti,
    formEliminarMeeti,
    eliminarMeeti
}