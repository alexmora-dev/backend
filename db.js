const mysql = require('mysql2');
require('dotenv').config();
//creamos la conexión
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

db.connect(err =>{
    if (err) {
        console.log('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL.');
});

module.exports = db; //Exportar el objeto conexión