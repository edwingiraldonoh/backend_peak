import request from 'supertest';
import express from 'express';
import { pool } from '../db.js'; 
import pedidosRoutes from '../routes/pedidos.routes.js';

// Mockea el módulo 'db.js' para controlar el comportamiento de la base de datos
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(), // Mockea la función query del pool
    },
}));

// Crea una aplicación Express para testear el router
const app = express();
app.use(express.json());
app.use('/pedidos', pedidosRoutes); // Monta el router en una ruta base

describe('pedidos.routes.js', () => {
    // Limpia los mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test para la ruta GET /pedidos (obtener todos los pedidos)
    describe('GET /pedidos', () => {
        test('Debería obtener todos los pedidos', async () => {
            // Datos de ejemplo que el mock de pool.query devolverá
            const mockPedidos = [
                { id_pedido: 1, fecha_pedido: '2024-01-01', estado_pedido: 'pendiente', cantidad: 2, tiempo_entrega_estimado: '2 días', detalles_pedido: 'Artículo A', resumen_pedido: 'Resumen A', total_pagar: 25.00 },
                { id_pedido: 2, fecha_pedido: '2024-01-02', estado_pedido: 'enviado', cantidad: 1, tiempo_entrega_estimado: '1 día', detalles_pedido: 'Artículo B', resumen_pedido: 'Resumen B', total_pagar: 15.50 },
            ];
            // Configura el mock para que devuelva los datos esperados
            pool.query.mockResolvedValueOnce([mockPedidos]);

            // Realiza la petición GET
            const res = await request(app).get('/pedidos');

            // Afirmaciones
            expect(res.statusCode).toEqual(200); // Espera un status 200 OK
            expect(res.body).toEqual(mockPedidos); // Espera que el cuerpo de la respuesta sea igual a los datos mockeados
            expect(pool.query).toHaveBeenCalledTimes(1); // Espera que pool.query haya sido llamado una vez
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM pedidos'); // Espera que la consulta sea la correcta
        });

        test('Debería manejar errores al obtener todos los pedidos', async () => {
            // Configura el mock para que rechace la promesa con un error
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            // Realiza la petición GET
            const res = await request(app).get('/pedidos');

            // Afirmaciones
            expect(res.statusCode).toEqual(500); // Espera un status 500 Internal Server Error
            expect(res.body).toEqual({ error: 'al obtener los datos de los pedidos' }); // Espera el mensaje de error específico
        });
    });

    // Test para la ruta GET /pedidos/:id (obtener pedido por ID)
    describe('GET /pedidos/:id', () => {
        test('Debería obtener un pedido por ID', async () => {
            const mockPedido = { id_pedido: 1, fecha_pedido: '2024-01-01', estado_pedido: 'pendiente', cantidad: 2, tiempo_entrega_estimado: '2 días', detalles_pedido: 'Artículo A', resumen_pedido: 'Resumen A', total_pagar: 25.00 };
            pool.query.mockResolvedValueOnce([[mockPedido]]);

            const res = await request(app).get('/pedidos/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockPedido);
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM pedidos WHERE id_pedido = ?', ['1']);
        });

        test('Debería devolver 404 si el pedido no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([[]]); // Simula que no se encontraron filas

            const res = await request(app).get('/pedidos/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Pedido no encontrado' });
        });

        test('Debería manejar errores al obtener el pedido por ID', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            const res = await request(app).get('/pedidos/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al obtener el pedido' });
        });
    });

    // Test para la ruta POST /pedidos (crear un nuevo pedido)
    describe('POST /pedidos', () => {
        test('Debería crear un nuevo pedido', async () => {
            const newPedido = { fecha_pedido: '2024-07-03', estado_pedido: 'procesando', cantidad: 3, tiempo_entrega_estimado: '3 días', detalles_pedido: 'Artículo C', resumen_pedido: 'Resumen C', total_pagar: 50.00 };
            // Simula el resultado de una inserción en la base de datos
            pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

            const res = await request(app)
                .post('/pedidos')
                .send(newPedido);

            expect(res.statusCode).toEqual(201); // Espera un status 201 Created
            expect(res.body).toEqual({ id: 3, ...newPedido }); // Espera el ID insertado y los datos del pedido
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO pedidos (fecha_pedido, estado_pedido, cantidad, tiempo_entrega_estimado, detalles_pedido, resumen_pedido, total_pagar) VALUES (?, ?, ?, ?, ?)',
                [newPedido.fecha_pedido, newPedido.estado_pedido, newPedido.cantidad, newPedido.tiempo_entrega_estimado, newPedido.detalles_pedido, newPedido.resumen_pedido, newPedido.total_pagar]
            );
        });

        test('Debería devolver 400 si faltan campos requeridos', async () => {
            const incompletePedido = { fecha_pedido: '2024-07-03', estado_pedido: 'procesando' }; // Faltan cantidad, tiempo_entrega_estimado, detalles_pedido, total_pagar

            const res = await request(app)
                .post('/pedidos')
                .send(incompletePedido);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'Datos requeridos' });
            expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
        });

        test('Debería manejar errores al crear un pedido', async () => {
            const newPedido = { fecha_pedido: '2024-07-03', estado_pedido: 'procesando', cantidad: 3, tiempo_entrega_estimado: '3 días', detalles_pedido: 'Artículo C', resumen_pedido: 'Resumen C', total_pagar: 50.00 };
            pool.query.mockRejectedValueOnce(new Error('Error de inserción'));

            const res = await request(app)
                .post('/pedidos')
                .send(newPedido);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al crear el pedido' });
        });
    });

    // Test para la ruta PUT /pedidos/:id (actualizar un pedido)
    describe('PUT /pedidos/:id', () => {
        test('Debería actualizar un pedido existente', async () => {
            const updatedPedido = { fecha_pedido: '2024-07-04', estado_pedido: 'completado', cantidad: 4, tiempo_entrega_estimado: '1 día', detalles_pedido: 'Artículo D', resumen_pedido: 'Resumen D', total_pagar: 75.00 };
            // Simula que una fila fue afectada (actualizada)
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const res = await request(app)
                .put('/pedidos/1')
                .send(updatedPedido);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Pedido actualizada correctamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE pedidos SET fecha_pedido = ?, estado_pedido = ?, cantidad = ?, tiempo_entrega_estimado = ?, detalles_pedido = ?, resumen_pedido = ?, total_pagar = ? WHERE id_pedido = ?',
                [updatedPedido.fecha_pedido, updatedPedido.estado_pedido, updatedPedido.cantidad, updatedPedido.tiempo_entrega_estimado, updatedPedido.detalles_pedido, updatedPedido.resumen_pedido, updatedPedido.total_pagar, '1']
            );
        });

        test('Debería devolver 404 si el pedido a actualizar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app)
                .put('/pedidos/999')
                .send({ fecha_pedido: '2024-07-04', estado_pedido: 'completado', cantidad: 1, tiempo_entrega_estimado: '1 día', detalles_pedido: 'Artículo X', resumen_pedido: 'Resumen X', total_pagar: 10.00 });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Pedido no encontrada ' });
        });

        test('Debería manejar errores al actualizar un pedido', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de actualización'));

            const res = await request(app)
                .put('/pedidos/1')
                .send({ fecha_pedido: '2024-07-04', estado_pedido: 'completado', cantidad: 1, tiempo_entrega_estimado: '1 día', detalles_pedido: 'Artículo X', resumen_pedido: 'Resumen X', total_pagar: 10.00 });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al actualizar el pedido' });
        });
    });

    // Test para la ruta DELETE /pedidos/:id (eliminar un pedido)
    describe('DELETE /pedidos/:id', () => {
        test('Debería eliminar un pedido existente', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula que una fila fue afectada (eliminada)

            const res = await request(app).delete('/pedidos/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Pedido eliminado corectamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM pedidos WHERE id_pedido = ?', ['1']);
        });

        test('Debería devolver 404 si el pedido a eliminar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app).delete('/pedidos/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Pedido no encontrado' });
        });

        test('Debería manejar errores al eliminar un pedido', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de eliminación'));

            const res = await request(app).delete('/pedidos/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al eliminar un pedido' });
        });
    });
});
