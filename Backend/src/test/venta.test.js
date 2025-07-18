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
        const newVenta = {
            id_venta: 4,
            id_usuario: 3,
            fecha_venta: '2023-01-03',
            total_venta: 200,
            comision: 20,
            mesero_encargado: 'Pedro',
        };

        test('debería crear una nueva venta', async () => {
            pool.query.mockResolvedValueOnce([{ insertId: 4 }]);

            const res = await request(app).post('/ventas').send(newVenta);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual({
                id: 4,
                fecha_venta: newVenta.fecha_venta,
                total_venta: newVenta.total_venta,
                comision: newVenta.comision,
                mesero_encargado: newVenta.mesero_encargado,
            });
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO venta (id_venta, id_usuario, fecha_venta, total_venta, comision, mesero_encargado) VALUES (?, ?, ?, ?, ?, ?)',
                [newVenta.id_venta, newVenta.id_usuario, newVenta.fecha_venta, newVenta.total_venta, newVenta.comision, newVenta.mesero_encargado]
            );
        });

        test('debería devolver 400 si faltan datos requeridos', async () => {
            const incompleteVenta = { id_usuario: 1, fecha_venta: '2023-01-01' }; // Faltan campos
            const res = await request(app).post('/ventas').send(incompleteVenta);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'Datos requeridos' });
        });

        test('debería manejar errores al crear una venta', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            const res = await request(app).post('/ventas').send(newVenta);
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al crear la venta' });
        });
    });

    // Test para la ruta PUT /ventas (Actualizar una venta existente)
    describe('PUT /ventas/:id', () => {
        const updatedVenta = {
            id_usuario: 1,
            fecha_venta: '2023-01-01',
            total_venta: 120,
            comision: 12,
            mesero_encargado: 'Juan Carlos',
        };

        test('debería actualizar una venta existente', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const res = await request(app).put('/ventas/1').send(updatedVenta);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Venta actualizada correctamente' });
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE venta SET id_usuario = ?, fecha_venta = ?, total_venta = ?, comision = ?, mesero_encargado = ? WHERE id_venta = ?',
                [updatedVenta.id_usuario, updatedVenta.fecha_venta, updatedVenta.total_venta, updatedVenta.comision, updatedVenta.mesero_encargado, '1']
            );
        });

        test('debería devolver 404 si la venta a actualizar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const res = await request(app).put('/ventas/999').send(updatedVenta);
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'venta no encontrada '});
        });

        test('debería manejar errores al actualizar una venta', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            const res = await request(app).put('/ventas/1').send(updatedVenta);
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