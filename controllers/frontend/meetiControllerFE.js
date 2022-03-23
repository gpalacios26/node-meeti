const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    // Si no existe
    if (!meeti) {
        res.redirect('/');
    }

    // Consultar después de verificar que existe el meeti
    const comentarios = await Comentarios.findAll({
        where: { meetiId: meeti.id },
        include: [
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        moment
    });
};

const confirmarAsistencia = async (req, res) => {
    const { accion } = req.body;

    if (accion === 'confirmar') {
        // Agregar el usuario
        await Meeti.update(
            { 'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id) },
            { 'where': { 'slug': req.params.slug } }
        );
        // Mensaje
        res.send('Has confirmado tu asistencia');
    } else {
        // Cancelar la asistencia
        await Meeti.update(
            { 'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id) },
            { 'where': { 'slug': req.params.slug } }
        );
        // Mensaje
        res.send('Has Cancelado tu asistencia');
    }
};

const mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({
        where: { slug: req.params.slug },
        attributes: ['interesados']
    });

    // Extraer interesados
    const { interesados } = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: { id: interesados }
    });

    res.render('asistentes-meeti', {
        nombrePagina: 'Listado Asistentes Meeti',
        asistentes
    });
};

const mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({
        attributes: ['id', 'nombre'],
        where: { slug: req.params.categoria }
    });

    const meetis = await Meeti.findAll({
        order: [
            ['fecha', 'ASC'],
            ['hora', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                where: { categoriaId: categoria.id }
            },
            {
                model: Usuarios
            }
        ]
    });

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    });
};

module.exports = {
    mostrarMeeti,
    confirmarAsistencia,
    mostrarAsistentes,
    mostrarCategoria
}