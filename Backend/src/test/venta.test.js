import request from 'supertest';
import express from 'express';
import { pool } from '../db.js'; 
import ventaRoutes from '../routes/venta.routes.js';

//Mockea el módulo 'db.js' para controlar el comportamiento de la base de datos
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(), // Mockea la función query del pool
    },
}));

//Crea una aplicación Express para testear el router
const app = express();
app.use(express.json()); //Necesario para parsear el body de las peticiones
app.use('/ventas', ventaRoutes); //Monta el router en una ruta base

describe('venta.routes.js', () => {
    // Limpia los mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test para la ruta GET /ventas (obtener todas las ventas)
    describe('GET /ventas', () => {
        test('Debería obtener todas las ventas', async () => {
            // Datos de ejemplo que el mock de pool.query devolverá
            const mockVentas = [
                { id_venta: 1, fecha_venta: '2024-01-01', total_venta: 100.00, mesero_encargado: 'Mesero A', comision: 5.00 },
                { id_venta: 2, fecha_venta: '2024-01-02', total_venta: 150.50, mesero_encargado: 'Mesero B', comision: 7.50 },
            ];
            // Configura el mock para que devuelva los datos esperados
            pool.query.mockResolvedValueOnce([mockVentas]);

            // Realiza la petición GET
            const res = await request(app).get('/ventas');

            // Afirmaciones
            expect(res.statusCode).toEqual(200); // Espera un status 200 OK
            expect(res.body).toEqual(mockVentas); // Espera que el cuerpo de la respuesta sea igual a los datos mockeados
            expect(pool.query).toHaveBeenCalledTimes(1); // Espera que pool.query haya sido llamado una vez
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM venta'); // Espera que la consulta sea la correcta
        });

        test('Debería manejar errores al obtener todas las ventas', async () => {
            // Configura el mock para que rechace la promesa con un error
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            // Realiza la petición GET
            const res = await request(app).get('/ventas');

            // Afirmaciones
            expect(res.statusCode).toEqual(500); // Espera un status 500 Internal Server Error
            expect(res.body).toEqual({ error: 'al obtener los datos de la venta' }); // Espera el mensaje de error específico
        });
    });

    // Test para la ruta GET /ventas/:id (obtener venta por ID)
    describe('GET /ventas/:id', () => {
        test('Debería obtener una venta por ID', async () => {
            const mockVenta = { id_venta: 1, fecha_venta: '2024-01-01', total_venta: 100.00, mesero_encargado: 'Mesero A', comision: 5.00 };
            pool.query.mockResolvedValueOnce([[mockVenta]]); // Nota el doble array para simular rows[0]

            const res = await request(app).get('/ventas/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockVenta);
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM venta WHERE id_venta = ?', ['1']);
        });

        test('Debería devolver 404 si la venta no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([[]]); // Simula que no se encontraron filas

            const res = await request(app).get('/ventas/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'venta no encontrada' });
        });

        test('Debería manejar errores al obtener la venta por ID', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            const res = await request(app).get('/ventas/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al obtener la venta' });
        });
    });

    // Test para la ruta POST /ventas (crear una nueva venta)
    describe('POST /ventas', () => {
        test('Debería crear una nueva venta', async () => {
            const newVenta = { fecha_venta: '2024-07-03', total_venta: 200.00, mesero_encargado: 'Mesero C', comision: 10.00 };
            // Simula el resultado de una inserción en la base de datos
            pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

            const res = await request(app)
                .post('/ventas')
                .send(newVenta);

            expect(res.statusCode).toEqual(201); // Espera un status 201 Created
            expect(res.body).toEqual({ id: 3, ...newVenta }); // Espera el ID insertado y los datos de la venta
            expect(pool.query).toHaveBeenCalledTimes(1);
            // La consulta SQL en tu archivo original tiene un error en los parámetros pasados.
            // Aquí, estoy asumiendo que la consulta debería ser para los campos de venta correctos.
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO venta (fecha_venta, total_venta, comision, mesero_encargado) VALUES (?, ?, ?, ?)',
                [newVenta.fecha_venta, newVenta.total_venta, newVenta.comision, newVenta.mesero_encargado]
            );
        });

        test('Debería devolver 400 si faltan campos requeridos', async () => {
            const incompleteVenta = { fecha_venta: '2024-07-03', total_venta: 50.00 };

            const res = await request(app)
                .post('/ventas')
                .send(incompleteVenta);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'Datos requeridos' });
            expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
        });

        test('Debería manejar errores al crear una venta', async () => {
            const newVenta = { fecha_venta: '2024-07-03', total_venta: 200.00, mesero_encargado: 'Mesero C', comision: 10.00 };
            pool.query.mockRejectedValueOnce(new Error('Error de inserción'));

            const res = await request(app)
                .post('/ventas')
                .send(newVenta);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al crear la venta' });
        });
    });

    // Test para la ruta PUT /ventas/:id (actualizar una venta)
    describe('PUT /ventas/:id', () => {
        test('Debería actualizar una venta existente', async () => {
            const updatedVenta = { fecha_venta: '2024-07-04', total_venta: 250.00, mesero_encargado: 'Mesero D', comision: 12.50 };
            // Simula que una fila fue afectada (actualizada)
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const res = await request(app)
                .put('/ventas/1')
                .send(updatedVenta);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Venta actualizada correctamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE venta SET fecha_venta = ?, total_venta = ?, comision = ?, mesero_encargado = ? WHERE id_venta = ?',
                [updatedVenta.fecha_venta, updatedVenta.total_venta, updatedVenta.comision, updatedVenta.mesero_encargado,'1']
            );
        });

        test('Debería devolver 404 si la venta a actualizar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app)
                .put('/ventas/999')
                .send({ fecha_venta: '2024-07-04', total_venta: 10.00, mesero_encargado: 'Mesero X', comision: 0.50 });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'venta no encontrada ' });
        });

        test('Debería manejar errores al actualizar una venta', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de actualización'));

            const res = await request(app)
                .put('/ventas/1')
                .send({ fecha_venta: '2024-07-04', total_venta: 10.00, mesero_encargado: 'Mesero X', comision: 0.50 });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al actualizar la venta' });
        });
    });

    // Test para la ruta DELETE /ventas/:id (eliminar una venta)
    describe('DELETE /ventas/:id', () => {
        test('Debería eliminar una venta existente', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula que una fila fue afectada (eliminada)

            const res = await request(app).delete('/ventas/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Venta eliminada corectamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM venta WHERE id_venta = ?', ['1']);
        });

        test('Debería devolver 404 si la venta a eliminar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app).delete('/ventas/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Venta no encontrada' });
        });

        test('Debería manejar errores al eliminar una venta', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de eliminación'));

            const res = await request(app).delete('/ventas/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al eliminar la venta' });
        });
    });
});