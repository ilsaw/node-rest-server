const express = require('express');
const _ = require('underscore');
let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

//Obtener todos los productos
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    let filtros = { disponible: true };

    Producto.find(filtros)
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments(filtros, (err, conteo) => {
                res.json({ ok: true, productos, cuantos: conteo });
            });

        });

});

//Obtener un producto por id
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!producto) {
                return res.status(400).json({
                    ok: true,
                    err: { message: 'No se encontró producto' }
                });
            }

            res.json({
                ok: true,
                producto
            });


        });

});

//Buscar productos
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

//Guarda producto
app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.preciouni,
        descripcion: body.descripcion,
        categoria: body.categoria

    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });

        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });
});

//Actualiza un producto por id
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Producto no existe' }
            });
        }

        let body = req.body;
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.preciouni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoUPD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoUPD
            });
        });
    });
});

//Elimina un producto por id
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;


    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Producto no existe' }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoUPD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoUPD,
                mensaje: 'producto eliminado'
            });
        });


    });

});

module.exports = app;