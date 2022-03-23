const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

const resultadosBusqueda = async (req, res) => {
    // Leer datos de la url 
    const { categoria, titulo, ciudad, pais } = req.query;

    // Si la categoria esta vacia
    let meetis;
    if (categoria === '') {
        meetis = await Meeti.findAll({
            where: {
                titulo: { [Op.iLike]: '%' + titulo + '%' },
                ciudad: { [Op.iLike]: '%' + ciudad + '%' },
                pais: { [Op.iLike]: '%' + pais + '%' }
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
    } else {
        meetis = await Meeti.findAll({
            where: {
                titulo: { [Op.iLike]: '%' + titulo + '%' },
                ciudad: { [Op.iLike]: '%' + ciudad + '%' },
                pais: { [Op.iLike]: '%' + pais + '%' }
            },
            include: [
                {
                    model: Grupos,
                    where: { categoriaId: { [Op.eq]: categoria } }
                },
                {
                    model: Usuarios,
                    attributes: ['id', 'nombre', 'imagen']
                }
            ]
        });
    }

    res.render('busqueda', {
        nombrePagina: 'Resultados Búsqueda',
        meetis,
        moment
    });
};

module.exports = {
    resultadosBusqueda
}