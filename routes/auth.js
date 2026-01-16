const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const { generateToken } = require('../utils/auth');

router.post('/login', (req, res) => {
    const { nom_usuario, contrasena } = req.body;
    db.query('select * from usuarios where nom_usuario = ?', [nom_usuario], async (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuarios o contraseña incorrectos' });
        }
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);//Usar el nombre del campo que hace la función de contraseña
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        //Si el logueo es correcto la aplicación genera un token y lo envía
        //console.log({ id: user.idusuarios, nom_usuario: user.nom_usuario });
        const token = generateToken({ id: user.idusuarios, nom_usuario: user.nom_usuario }); // Ajuste aquí
        res.json({ message: 'Logueo exitoso', token });
    });
});

module.exports = router;