const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');
const bcrypt = require('bcrypt');

//Método get para registro único
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params;//Capturar el id desde los parámetros de la URL
    const query = 'SELECT * FROM cliente WHERE idcliente = ?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener el cliente' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(results[0]);
    });
});

//Método Get para multiples registros con paginación y búsqueda
router.get('/', verifyToken, (req, res) => {
    //Obtener parámetros de la URL
    const page = parseInt(req.query.page) || 1; //pagina actual, por defecto 1
    const limit = parseInt(req.query.limit) || 10; //límite de registros, por defecto 10
    const offset = (page - 1) * limit; //El punto de inicio de la consulta
    const cadena = req.query.cadena;
    let whereClause = '';
    let queryParams = [];
    if (cadena) {
        whereClause = 'where cedula like ? or nombres like ? or apellidos like ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    //consulta para obtener total de registros
    const countQuery = `select count(*) as total from cliente ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de clientes' });
        }
        const totalClientes = countResult[0].total;
        const totalPages = Math.ceil(totalClientes / limit);
        //consulta para obtener los registros de la página
        const clientesQuery = `select * from cliente ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(clientesQuery, queryParams, (err, clientesResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener los clientes' });
            }
            //Enviar respuesta con los datos y la información de paginación
            res.json({
                totalItems: totalClientes,
                totalPage: totalPages,
                currentPage: page,
                limit: limit,
                data: clientesResult
            });
        });
    });
});

//Método POST
router.post('/', verifyToken, (req, res) => {
    //Obtener los datos
    const { cedula, nombres, apellidos, telefono, correo, direccion, fecha_nacimiento } = req.body;
    const search_query = 'select count(*) as contador from cliente where cedula = ?';
    db.query(search_query, [cedula], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error interno al verificar el cliente" });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: "El cliente con cédula " + cedula + " ya existe" });
        }
        const query = 'insert into cliente values (null, ?, ?, ?, ?, ?, ?, ?)';
        const values = [cedula, nombres, apellidos, telefono, correo, direccion, fecha_nacimiento];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al insertar cliente' });
            }
            res.status(201).json({
                message: 'Cliente insertado correctamente',
                idcliente: result.insertId
            })
        })
    })


})

//MÉTODO PUT
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { cedula, nombres, apellidos, telefono, correo, direccion, fecha_nacimiento } = req.body;
    const query = 'update cliente set cedula = ?, nombres = ?, apellidos = ?, telefono = ?, correo = ?, direccion = ?, fecha_nacimiento = ? where idcliente = ?;';
    const values = [cedula, nombres, apellidos, telefono, correo, direccion, fecha_nacimiento, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar cliente' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" })
        }
        res.status(200).json({
            message: 'Cliente actualizado correctamente'
        })
    })
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const search_query = 'select count(*) as contador from alquiler where cliente_idcliente = ?';
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error interno al verificar el alquiler" });
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: "Cliente no se puede eliminar porque tiene alquiler registrado" });
        }
        const query = 'delete from cliente where idcliente = ?;';
        const values = [id];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar cliente' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Cliente no encontrado" })
            }
            res.status(200).json({
                message: 'Cliente eliminado correctamente'
            })
        })
    });



});

module.exports = router;