const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { fileSize: 250000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/perfiles/');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // El formato es valido
            next(null, true);
        } else {
            // El formato no es valido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

const subirImagen = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    });
};

const formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    });
};

const crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    // Verificar si el usuario existe
    const usuarioExiste = await Usuarios.findOne({ where: { email: usuario.email } });

    // Si existe, redireccionar
    if (usuarioExiste) {
        req.flash('error', 'Ya existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    req.checkBody('confirmar', 'El password confirmado no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    // Leer los errores de express
    const erroresExpress = req.validationErrors();

    try {
        await Usuarios.create(usuario);

        // URL de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        // Enviar email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });

        // Flash Message y redireccionar
        req.flash('exito', 'Hemos enviado un E-mail, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        // Extraer el message de los errores
        const erroresSequelize = (error.errors && Array.isArray(error.errors)) ? error.errors.map(err => err.message) : [];

        // Extraer unicamente el msg de los errores
        const errExp = (erroresExpress && Array.isArray(erroresExpress)) ? erroresExpress.map(err => err.msg) : [];

        // Unir los mensajes
        const listaErrores = [...erroresSequelize, ...errExp];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
};

const confirmarCuenta = async (req, res, next) => {
    // Verificar que el usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo } });

    // Si no existe, redireccionar
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    // Si existe, confirmar suscripción y redireccionar
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
};

const formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    })
};

const formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    });
};

const editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    req.sanitizeBody('nombre');
    req.sanitizeBody('email');

    // Leer datos del form
    const { nombre, descripcion, email } = req.body;

    // Asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    // Guardar en la BD y redireccionar
    await usuario.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');
};

const formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    });
};

const cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    // Verificar que el password anterior sea correcto
    if (!usuario.validarPassword(req.body.anterior)) {
        req.flash('error', 'El password actual es incorrecto');
        res.redirect('/administracion');
        return next();
    }

    // Si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);

    // Asignar el password al usuario
    usuario.password = hash;

    // Guardar en la BD
    await usuario.save();

    req.logout();
    req.flash('exito', 'Password Modificado Correctamente, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');
};

const formSubirImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Subir Imagen perfil',
        usuario
    });
};

const guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    // Si hay imagen anterior, eliminarla
    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        // Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        });
    }

    // Almacenar la nueva imagen
    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    // Guardar en la BD y redireccionar
    await usuario.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
};

module.exports = {
    subirImagen,
    formCrearCuenta,
    crearNuevaCuenta,
    confirmarCuenta,
    formIniciarSesion,
    formEditarPerfil,
    editarPerfil,
    formCambiarPassword,
    cambiarPassword,
    formSubirImagenPerfil,
    guardarImagenPerfil
}