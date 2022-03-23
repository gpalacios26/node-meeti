const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const path = require("path");
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const router = require('./routes');

require('dotenv').config({ path: 'variables.env' });

// Crear la conexión a la BD
const db = require('./config/db');

// Importar los modelos
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meeti');
require('./models/Comentarios');

// Sincronizar a la BD y crear tablas
db.sync()
    .then(() => console.log('Conectado a la DB'))
    .catch(error => console.log(error));

// Crear servidor express
const app = express();

// Body parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express validator (validación con bastantes funciones)
app.use(expressValidator());

// Habilitar plantillas EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Ubicación vistas
app.set('views', path.join(__dirname, './views'));

// Archivos estáticos
app.use(express.static('public'));

// Habilitar cookie parser
app.use(cookieParser());

// Crear la session
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Agrega flash messages
app.use(flash());

// Middleware (fecha actual, flash messages, usuario logueado)
app.use((req, res, next) => {
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    res.locals.mensajes = req.flash();
    res.locals.usuario = { ...req.user } || null;
    next();
});

// Agregar el routing
app.use('/', router);

// Escuchar el servidor desde el puerto configurado
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ' + process.env.PORT);
});