const Sequelize = require('sequelize');

const db = new Sequelize('meeti', 'postgres', 'Sistemas.26', {
    host: '127.0.0.1',
    dialect: 'postgres',
    port: '5432',
    define: {
        timestamps: false
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
});

module.exports = db;