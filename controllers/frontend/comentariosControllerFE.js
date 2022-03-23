const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Meeti');

const agregarComentario = async (req, res, next) => {
    const { comentario } = req.body;

    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    // Redireccionar a la misma pagina
    res.redirect('back');
    next();
};

const eliminarComentario = async (req, res, next) => {
    const { comentarioId } = req.body;

    // Consultar el Comentario
    const comentario = await Comentarios.findOne({ where: { id: comentarioId } });

    // Verificar si existe el comentario
    if (!comentario) {
        res.status(404).send('Acción no válida');
        return next();
    }

    const meeti = await Meeti.findOne({ where: { id: comentario.meetiId } });

    // Verificiar que quien lo borra sea el creador
    if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        await Comentarios.destroy({
            where: {
                id: comentario.id
            }
        });
        res.status(200).send('Eliminado Correctamente');
        return next();
    } else {
        res.status(403).send('Acción no válida');
        return next();
    }
};

module.exports = {
    agregarComentario,
    eliminarComentario
}