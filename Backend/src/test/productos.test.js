import request from 'supertest';
import express from 'express';
import { pool } from '../db.js';
import productosRoutes from '../routes/productos.routes.js';

// Mockea el módulo 'db.js' para controlar el comportamiento de la base de datos
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(), // Mockea la función query del pool
    },
}));

// Crea una aplicación Express para testear el router
const app = express();
app.use(express.json()); // Necesario para parsear el body de las peticiones
app.use('/productos', productosRoutes); // Monta el router en una ruta base

describe('productos.routes.js', () => {
    // Limpia los mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test para la ruta GET /productos (obtener todos los productos)
    describe('GET /productos', () => {
        test('Debería obtener todos los productos', async () => {
            // Datos de ejemplo que el mock de pool.query devolverá
            const mockProductos = [
                { id_producto: 1, nombre_producto: 'Producto A', descripcion_producto: 'Descripción A', precio_producto: 10.00, tiempo_preparacion: '10 min', categoria: 'Bebidas' },
                { id_producto: 2, nombre_producto: 'Producto B', descripcion_producto: 'Descripción B', precio_producto: 20.50, tiempo_preparacion: '20 min', categoria: 'Comida' },
            ];
            // Configura el mock para que devuelva los datos esperados
            pool.query.mockResolvedValueOnce([mockProductos]);

            // Realiza la petición GET
            const res = await request(app).get('/productos');

            // Afirmaciones
            expect(res.statusCode).toEqual(200); // Espera un status 200 OK
            expect(res.body).toEqual(mockProductos); // Espera que el cuerpo de la respuesta sea igual a los datos mockeados
            expect(pool.query).toHaveBeenCalledTimes(1); // Espera que pool.query haya sido llamado una vez
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM productos'); // Espera que la consulta sea la correcta
        });

        test('Debería manejar errores al obtener todos los productos', async () => {
            // Configura el mock para que rechace la promesa con un error
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            // Realiza la petición GET
            const res = await request(app).get('/productos');

            // Afirmaciones
            expect(res.statusCode).toEqual(500); // Espera un status 500 Internal Server Error
            expect(res.body).toEqual({ error: 'al obtener los productos' }); // Espera el mensaje de error específico
        });
    });

    // Test para la ruta GET /productos/:id (obtener producto por ID)
    describe('GET /productos/:id', () => {
        test('Debería obtener un producto por ID', async () => {
            const mockProducto = { id_producto: 1, nombre_producto: 'Producto A', descripcion_producto: 'Descripción A', precio_producto: 10.00, tiempo_preparacion: '10 min', categoria: 'Bebidas' };
            pool.query.mockResolvedValueOnce([[mockProducto]]); // Nota el doble array para simular rows[0]

            const res = await request(app).get('/productos/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockProducto);
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM productos WHERE id_producto = ?', ['1']);
        });

        test('Debería devolver 404 si el producto no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([[]]); // Simula que no se encontraron filas

            const res = await request(app).get('/productos/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'producto no encontrado' });
        });

        test('Debería manejar errores al obtener el producto por ID', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            const res = await request(app).get('/productos/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al obtener el producto' });
        });
    });

    // Test para la ruta POST /productos (crear un nuevo producto)
    describe('POST /productos', () => {
        test('Debería crear un nuevo producto', async () => {
            const newProducto = { nombre_producto: 'Producto C', descripcion_producto: 'Descripción C', precio_producto: 15.00, tiempo_preparacion: '15 min', categoria: 'Postres' };
            // Simula el resultado de una inserción en la base de datos
            pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

            const res = await request(app)
                .post('/productos')
                .send(newProducto);

            expect(res.statusCode).toEqual(201); // Espera un status 201 Created
            expect(res.body).toEqual({ id: 3, ...newProducto }); // Espera el ID insertado y los datos del producto
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, tiempo_preparacion categoria) VALUES (?, ?, ?, ?)',
                [newProducto.nombre_producto, newProducto.descripcion_producto, newProducto.precio_producto, newProducto.categoria] 
            );
        });

        test('Debería devolver 400 si faltan campos requeridos', async () => {
            const incompleteProducto = { nombre_producto: 'Producto Incompleto', precio_producto: 5.00 };

            const res = await request(app)
                .post('/productos')
                .send(incompleteProducto);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'Nombre y precio son reuqeridos' });
            expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
        });

        test('Debería manejar errores al crear un producto', async () => {
            const newProducto = { nombre_producto: 'Producto con Error', descripcion_producto: 'Descripción Error', precio_producto: 99.99, tiempo_preparacion: '5 min', categoria: 'Snacks' };
            pool.query.mockRejectedValueOnce(new Error('Error de inserción'));

            const res = await request(app)
                .post('/productos')
                .send(newProducto);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al crear el producto' });
        });
    });

    // Test para la ruta PUT /productos/:id (actualizar un producto)
    describe('PUT /productos/:id', () => {
        test('Debería actualizar un producto existente', async () => {
            const updatedProducto = { nombre_producto: 'Producto Actualizado', descripcion_producto: 'Nueva Descripción', precio_producto: 12.50, tiempo_preparacion: '8 min', categoria: 'Bebidas' };
            // Simula que una fila fue afectada (actualizada)
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const res = await request(app)
                .put('/productos/1')
                .send(updatedProducto);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Producto actualizado correctamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE productos SET nombre_producto = ?, descripcion_producto = ?, precio_producto = ?, tiempo_preparacion = ?, categoria = ? WHERE id_producto = ?',
                [updatedProducto.nombre_producto, updatedProducto.descripcion_producto, updatedProducto.precio_producto, updatedProducto.tiempo_preparacion, updatedProducto.categoria, '1']
            );
        });

        test('Debería devolver 404 si el producto a actualizar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app)
                .put('/productos/999')
                .send({ nombre_producto: 'Producto Inexistente', descripcion_producto: 'Desc', precio_producto: 1.00, tiempo_preparacion: '1 min', categoria: 'Otro' });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Producto no encontrado ' });
        });

        test('Debería manejar errores al actualizar un producto', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de actualización'));

            const res = await request(app)
                .put('/productos/1')
                .send({ nombre_producto: 'Producto con Error', descripcion_producto: 'Desc', precio_producto: 1.00, tiempo_preparacion: '1 min', categoria: 'Otro' });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al actualizar el producto' });
        });
    });

    // Test para la ruta DELETE /productos/:id (eliminar un producto)
    describe('DELETE /productos/:id', () => {
        test('Debería eliminar un producto existente', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula que una fila fue afectada (eliminada)

            const res = await request(app).delete('/productos/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Producto eliminado corectamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM productos WHERE id_producto = ?', ['1']);
        });

        test('Debería devolver 404 si el producto a eliminar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app).delete('/productos/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Producto no encontrado' });
        });

        test('Debería manejar errores al eliminar un producto', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de eliminación'));

            const res = await request(app).delete('/productos/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al eliminar el producto' });
        });
    });
});