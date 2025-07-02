// Encuesta satisfaccion .Routes

//import { Router } from 'express';
import pkg from 'express'; // Importa el módulo completo como 'pkg'
const { Router } = pkg; // Desestructura 'Router' del objeto 'pkg'
import { pool } from '../db.js';

const router = Router();

//Obtener todas las encuestas de satisfaccion
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM encuesta_satisfaccion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener las encuestas de satisfaccion' });
    }
});

//Obtener encuestas de satisfaccion por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM encuesta_satisfaccion WHERE id_encuesta = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Encuesta no encontrada' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener la encuesta' });
    }
});

//Crear una nueva encuesta de satisfaccion
router.post('/', async (req, res) => {
    const {puntuacion, comentarios, fecha_encuesta} = req.body;

    if (!puntuacion || !comentarios || fecha_encuesta) {
        return res.status(400).json({error: 'Puntuacion y comentarios necesarios'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO encuesta_satisfaccion (puntuacion, comentarios, fecha_encuesta) VALUES (?, ?)',
            [puntuacion, comentarios, fecha_encuesta]
        );
        res.status(201).json({ id: result.insertId, puntuacion, comentarios, fecha_encuesta });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la encuesta de satisfaccion' });
    }
});

//Actualizar una encuesta de satisfaccion existente
router.put('/:id', async (req, res) => {
    const { puntuacion, comentarios, fecha_encuesta } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE encuesta_satisfaccion SET puntuacion = ?, comentarios = ?, fecha_encuesta = ? WHERE id_encuesta = ?',
            [puntuacion, comentarios, fecha_encuesta, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Encuesta no encontrada '});

        res.json({ message: 'Encuesta de satisfaccion actualizada correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

//Eliminar un encuesta de satisfaccion
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM encuesta_satisfaccion WHERE id_encuesta = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Encuesta no encontrada' });

        res.json({ message: 'Encuesta eliminada correctamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la encuesta' });
    }
});


//Facturacion .Routes


//Obtener todas las facturas
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM facturacion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener la factura' });
    }
});

//Obtener las facturas por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM facturacion WHERE id_factura= ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener la facturacion' });
    }
});

//Crear una nueva facturacion
router.post('/', async (req, res) => {
    const {fecha_factura, metodo_pago, descuentos, impuesto, tipo_facturacion} = req.body;

    if (!fecha_factura || !metodo_pago || !descuentos || !impuesto|| !tipo_facturacion) {
        return res.status(400).json({error: 'Metodo de pago y tipo de facturacion son requeridos'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO factura (metodo_pago, descuentos, impuesto, tipo_facturacion) VALUES (?, ?, ?, ?)',
            [fecha_factura, metodo_pago, descuentos, impuesto, tipo_facturacion]
        );
        res.status(201).json({ id: result.insertId, fecha_factura, metodo_pago, descuentos, impuesto, tipo_facturacion});
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la factura' });
    }
});

//Actualizar una factura existente
router.put('/:id', async (req, res) => {
    const {fecha_factura, metodo_pago, descuentos, impuesto, tipo_facturacion} = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE facturacion SET fecha_facturacion = ?, metodo_pago = ?, descuentos = ?, impuesto = ?, tipo_facturacion = ? WHERE id_factura = ?',
            [fecha_factura, metodo_pago, descuentos, impuesto, tipo_facturacion, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Factura no encontrada '});

        res.json({ message: 'Factura actualizada correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la factura' });
    }
});

//Eliminar una factura
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM facturacion WHERE id_factura = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Factura no encontrada' });

        res.json({ message: 'Factura eliminada corectamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la factura' });
    }
});


// Informe Inventario .Routes


//Obtener todos los informes de inventarios
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM informe_inventario');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener las encuestas de satisfaccion' });
    }
});

//Obtener el informe de inventario por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM informe_inventario WHERE id_informe = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Informe no encontrado' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener el informe' });
    }
});

//Crear un nuevo informe de inventario
router.post('/', async (req, res) => {
    const {fecha_informe, descripcion_informe} = req.body;

    if (!fecha_informe || !descripcion_informe) {
        return res.status(400).json({error: 'La descripcion es necesaria'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO informe_inventario (fecha_informe, descripcion_informe) VALUES (?)',
            [descripcion_informe]
        );
        res.status(201).json({ id: result.insertId, fecha_informe, descripcion_informe });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la descripcion del informe' });
    }
});

//Actualizar el informe de inventario existente
router.put('/:id', async (req, res) => {
    const { fecha_informe, descripcion_informe } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE informe_inventario SET fecha_informe = ?, descripcion_informe = ? WHERE id_informe = ?',
            [fecha_informe, descripcion_informe, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Informe no encontrado '});

        res.json({ message: 'Informe de inventario actualizado correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el informe de inventario' });
    }
});

//Eliminar el informe de inventario
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM informe_inventario WHERE id_informe = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Informe no encontrado' });

        res.json({ message: 'Informe eliminado correctamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el informe' });
    }
});


//Inventario .Routes


//Obtener todos los inventarios
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventario');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener los datos del inventario' });
    }
});

//Obtener el inventario por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventario WHERE id_inventario = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'inventario no encontrada' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener el inventario' });
    }
});

//Crear una nuevo inventario
router.post('/', async (req, res) => {
    const {cantidad_disponible, unidad_medida, fecha_actualizacion, alerta_stock} = req.body;

    if (!cantidad_disponible || !unidad_medida || !fecha_actualizacion || !alerta_stock) {
        return res.status(400).json({error: 'Datos requeridos obligaroriamente'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO venta (cantidad_disponible, unidad_medida, fecha_actualizacion, alerta_stock) VALUES (?, ?, ?)',
            [cantidad_disponible, unidad_medida, fecha_actualizacion, alerta_stock]
        );
        res.status(201).json({ id: result.insertId, cantidad_disponible, unidad_medida, fecha_actualizacion, alerta_stock });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el inventario' });
    }
});

//Actualizar un inventario existente
router.put('/:id', async (req, res) => {
    const { cantidad_disponible, unidad_medida, fecha_actualizacion, alerta_stock } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE inventario SET cantidad_disponible = ?, unidad_medida = ?, fecha_actualizacion = ?, alerta_stock = ? WHERE id_inventario = ?',
            [cantidad_disponible, unidad_medida, fecha_actualizacion, alerta_stock, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Inventario no encontrado '});

        res.json({ message: 'Inventario actualizado correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el inventario' });
    }
});

//Eliminar un inventario
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM inventario WHERE id_inventario = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Inventario no encontrado' });

        res.json({ message: 'Inventario eliminado corectamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el inventario' });
    }
});


//Notificaciones .Routes


//Obtener todos las notificaciones
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM notificacion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener los datos de la notificacion' });
    }
});

//Obtener las notificaciones por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM notificacion WHERE id_notificacion = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'notificacion no encontrada' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener la notificacion' });
    }
});

//Crear una nueva notificacion
router.post('/', async (req, res) => {
    const {mensaje_notificacion, fecha_notificacion, estado_notificacion, destinatario} = req.body;

    if (!mensaje_notificacion || !fecha_notificacion || !estado_notificacion || !destinatario) {
        return res.status(400).json({error: 'Datos requeridos obligatoriamente'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO notificacion (mensaje_notificacion, fecha_notificacion, estado_notificacion, destinatario) VALUES (?, ?, ?)',
            [mensaje_notificacion, fecha_notificacion, estado_notificacion, destinatario]
        );
        res.status(201).json({ id: result.insertId, mensaje_notificacion, fecha_notificacion, estado_notificacion, destinatario });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la notificacion' });
    }
});

//Actualizar una notificacion existente
router.put('/:id', async (req, res) => {
    const { mensaje_notificacion, fecha_notificacion, estado_notificacion, destinatario } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE notificacion SET mensaje_notificacion = ?, fecha_notificacion = ?, estado_notificacion = ?, destinatario = ? WHERE id_notificacion = ?',
            [mensaje_notificacion, fecha_notificacion, estado_notificacion, destinatario, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Notificacion no encontrada '});

        res.json({ message: 'Notificacion actualizada correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la notificacion' });
    }
});

// 😃 Eliminar una notificacion
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM notificacion WHERE id_notificacion = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Notificacion no encontrada' });

        res.json({ message: 'Notificacion eliminada corectamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la notificacion' });
    }
});


//Pedidos .Routes


//Obtener todos los pedidos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pedidos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener los datos de los pedidos' });
    }
});

//Obtener los pedidos por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener el pedido' });
    }
});

//Crear una nuevo pedido
router.post('/', async (req, res) => {
    const {fecha_pedido, estado_pedido, cantidad, tiempo_entrega_estimado, detalles_pedido, resumen_pedido, total_pagar} = req.body;

    if (!fecha_pedido || !estado_pedido || !cantidad || !tiempo_entrega_estimado|| !detalles_pedido ||!total_pagar ) {
        return res.status(400).json({error: 'Datos requeridos'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO pedidos (fecha_pedido, estado_pedido, cantidad, tiempo_entrega_estimado, detalles_pedido, resumen_pedido, total_pagar) VALUES (?, ?, ?, ?, ?)',
            [fecha_pedido, estado_pedido, cantidad, tiempo_entrega_estimado, detalles_pedido, resumen_pedido, total_pagar]
        );
        res.status(201).json({ id: result.insertId, fecha_pedido, estado_pedido, cantidad, tiempo_entrega_estimado, detalles_pedido, resumen_pedido, total_pagar });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
});

//Actualizar un pedido existente
router.put('/:id', async (req, res) => {
    const { fecha_pedido, estado_pedido,  cantidad, detalles_pedido, tiempo_entrega_estimado, resumen_pedido, total_pagar } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE pedidos SET fecha_pedido = ?, estado_pedido = ?, cantidad = ?, tiempo_entrega_estimado = ?, detalles_pedido = ?, resumen_pedido = ?, total_pagar = ? WHERE id_pedido = ?',
            [fecha_pedido, estado_pedido, cantidad, tiempo_entrega_estimado, detalles_pedido, resumen_pedido, total_pagar, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Pedido no encontrada '});

        res.json({ message: 'Pedido actualizada correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el pedido' });
    }
});

//Eliminar un pedido
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM pedidos WHERE id_pedido = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

        res.json({ message: 'Pedido eliminado corectamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar un pedido' });
    }
});


// Productos .Routes


//Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener los productos' });
    }
});

//Obtener productos por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'producto no encontrado' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

//Crear un nuevo producto
router.post('/', async (req, res) => {
    const {nombre_producto, descripcion_producto, precio_producto, tiempo_preparacion, categoria} = req.body;

    if (!nombre_producto || !descripcion_producto || !precio_producto || !tiempo_preparacion || !categoria) {
        return res.status(400).json({error: 'Nombre y precio son reuqeridos'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, tiempo_preparacion categoria) VALUES (?, ?, ?, ?)',
            [nombre_producto, descripcion_producto, precio_producto, categoria]
        );
        res.status(201).json({ id: result.insertId, nombre_producto, descripcion_producto, precio_producto, tiempo_preparacion, categoria });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

//Actualizar producto existente
router.put('/:id', async (req, res) => {
    const { nombre_producto, descripcion_producto, precio_producto, tiempo_preparacion, categoria } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE productos SET nombre_producto = ?, descripcion_producto = ?, precio_producto = ?, tiempo_preparacion = ?, categoria = ? WHERE id_producto = ?',
            [nombre_producto, descripcion_producto, precio_producto, tiempo_preparacion, categoria, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Producto no encontrado '});

        res.json({ message: 'Producto actualizado correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

//Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });

        res.json({ message: 'Producto eliminado corectamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});


//Usuarios .Routes


//Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener los datos del usuario' });
    }
});

//Obtener los usuarios por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

//Crear un nuevo usuario
router.post('/', async (req, res) => {
    const {nombre_usuario, apellido_usuario, contraseña, correo_electronico, telefono, fecha_creacion, fecha_modificacion} = req.body;

    if (!nombre_usuario || !apellido_usuario || !contraseña || !correo_electronico || !telefono || !fecha_creacion || !fecha_modificacion )  {
        return res.status(400).json({error: 'Datos requeridos obligatoriamente'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre_usuario, apellido_usuario, estado, rol, contraseña, correo_electronico, telefono, fecha_creacion, fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre_usuario, apellido_usuario, contraseña, correo_electronico, telefono, fecha_creacion, fecha_modificacion]
        );
        res.status(201).json({ id: result.insertId, nombre_usuario, apellido_usuario, contraseña, correo_electronico, telefono, fecha_creacion, fecha_modificacion });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

//Actualizar un usuario existente
router.put('/:id', async (req, res) => {
    const { nombre_usuario, apellido_usuario ,contraseña, correo_electronico, telefono, fecha_creacion, fecha_modificacion } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET nombre_usuario = ?, apellido_usuario = ?, contraseña = ?, correo_electonico = ?, telefono = ?, fecha_creacion = ?, fecha_modificacion = ? WHERE id_usuario = ?',
            [nombre_usuario, apellido_usuario ,contraseña, correo_electronico, telefono, fecha_creacion, fecha_modificacion, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Usuario no encontrado '});

        res.json({ message: 'Usuario actualizado correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

//Eliminar un usuario
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({ message: 'Usuario eliminado corectamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});


// Venta .Routes


//Obtener todos las ventas
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM venta');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener los datos de la venta' });
    }
});

//Obtener las ventas por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM venta WHERE id_venta = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'venta no encontrada' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener la venta' });
    }
});

//Crear una nueva venta
router.post('/', async (req, res) => {
    const {fecha_venta, total_venta, mesero_encargado, comision} = req.body;

    if (!fecha_venta || !total_venta || !comision || !mesero_encargado) {
        return res.status(400).json({error: 'Datos requeridos'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO venta (fecha_venta, total_venta, mesero_encargado, comision) VALUES (?, ?, ?)',
            [nombre, descripcion, precio]
        );
        res.status(201).json({ id: result.insertId, fecha_venta, total_venta, mesero_encargado, comision });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la venta' });
    }
});

//Actualizar una venta existente
router.put('/:id', async (req, res) => {
    const { fecha_venta, total_venta, mesero_encargado, comision } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE venta SET fecha_venta = ?, total_venta = ?, mesero_encargado = ?, comision = ? WHERE id_venta = ?',
            [fecha_venta, total_venta, mesero_encargado, comision, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'venta no encontrada '});

        res.json({ message: 'Venta actualizada correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la venta' });
    }
});

//Eliminar una venta
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM venta WHERE id_venta = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Venta no encontrada' });

        res.json({ message: 'Venta eliminada corectamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la venta' });
    }
});


export default router;