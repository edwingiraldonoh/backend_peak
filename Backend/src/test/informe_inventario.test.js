// Importa las dependencias necesarias para el testing
import request from 'supertest';
import express from 'express';
import { pool } from '../db.js'; // Asegúrate de que la ruta a tu pool de base de datos sea correcta

// Importa el router que quieres testear
// RUTA CORREGIDA: Asumiendo que informe_inventario.Routes.js está en src/routes/
// y el archivo de test está en src/test/
import informeInventarioRoutes from '../routes/informe_inventario.Routes.js';

// Mockea el módulo 'db.js' para controlar el comportamiento de la base de datos
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(), // Mockea la función query del pool
    },
}));

// Crea una aplicación Express para testear el router
const app = express();
app.use(express.json()); // Necesario para parsear el body de las peticiones
app.use('/informes', informeInventarioRoutes); // Monta el router en una ruta base

describe('informe_inventario.Routes.js', () => {
    // Limpia los mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test para la ruta GET /informes (obtener todos los informes)
    describe('GET /informes', () => {
        test('Debería obtener todos los informes de inventario', async () => {
            // Datos de ejemplo que el mock de pool.query devolverá
            const mockInformes = [
                { id_informe: 1, fecha_informe: '2024-01-01', descripcion_informe: 'Informe A' },
                { id_informe: 2, fecha_informe: '2024-01-02', descripcion_informe: 'Informe B' },
            ];
            // Configura el mock para que devuelva los datos esperados
            pool.query.mockResolvedValueOnce([mockInformes]);

            // Realiza la petición GET
            const res = await request(app).get('/informes');

            // Afirmaciones
            expect(res.statusCode).toEqual(200); // Espera un status 200 OK
            expect(res.body).toEqual(mockInformes); // Espera que el cuerpo de la respuesta sea igual a los datos mockeados
            expect(pool.query).toHaveBeenCalledTimes(1); // Espera que pool.query haya sido llamado una vez
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM informe_inventario'); // Espera que la consulta sea la correcta
        });

        test('Debería manejar errores al obtener todos los informes', async () => {
            // Configura el mock para que rechace la promesa con un error
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            // Realiza la petición GET
            const res = await request(app).get('/informes');

            // Afirmaciones
            expect(res.statusCode).toEqual(500); // Espera un status 500 Internal Server Error
            expect(res.body).toEqual({ error: 'al obtener las encuestas de satisfaccion' }); // Espera el mensaje de error específico
        });
    });

    // Test para la ruta GET /informes/:id (obtener informe por ID)
    describe('GET /informes/:id', () => {
        test('Debería obtener un informe de inventario por ID', async () => {
            const mockInforme = { id_informe: 1, fecha_informe: '2024-01-01', descripcion_informe: 'Informe A' };
            pool.query.mockResolvedValueOnce([[mockInforme]]); // Nota el doble array para simular rows[0]

            const res = await request(app).get('/informes/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockInforme);
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM informe_inventario WHERE id_informe = ?', ['1']);
        });

        test('Debería devolver 404 si el informe no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([[]]); // Simula que no se encontraron filas

            const res = await request(app).get('/informes/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Informe no encontrado' });
        });

        test('Debería manejar errores al obtener el informe por ID', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            const res = await request(app).get('/informes/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al obtener el informe' });
        });
    });

    // Test para la ruta POST /informes (crear un nuevo informe)
    describe('POST /informes', () => {
        test('Debería crear un nuevo informe de inventario', async () => {
            const newInforme = { fecha_informe: '2024-07-03', descripcion_informe: 'Nuevo Informe de Prueba' };
            // Simula el resultado de una inserción en la base de datos
            pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

            const res = await request(app)
                .post('/informes')
                .send(newInforme);

            expect(res.statusCode).toEqual(201); // Espera un status 201 Created
            expect(res.body).toEqual({ id: 3, ...newInforme }); // Espera el ID insertado y los datos del informe
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO informe_inventario (fecha_informe, descripcion_informe) VALUES (?)',
                [newInforme.descripcion_informe] // Asegúrate de que esto coincida con tu implementación
            );
        });

        test('Debería devolver 400 si faltan campos requeridos', async () => {
            const incompleteInforme = { fecha_informe: '2024-07-03' }; // Falta descripcion_informe

            const res = await request(app)
                .post('/informes')
                .send(incompleteInforme);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'La descripcion es necesaria' });
            expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
        });

        test('Debería manejar errores al crear un informe', async () => {
            const newInforme = { fecha_informe: '2024-07-03', descripcion_informe: 'Informe con Error' };
            pool.query.mockRejectedValueOnce(new Error('Error de inserción'));

            const res = await request(app)
                .post('/informes')
                .send(newInforme);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al crear la descripcion del informe' });
        });
    });

    // Test para la ruta PUT /informes/:id (actualizar un informe)
    describe('PUT /informes/:id', () => {
        test('Debería actualizar un informe de inventario existente', async () => {
            const updatedInforme = { fecha_informe: '2024-07-04', descripcion_informe: 'Informe Actualizado' };
            // Simula que una fila fue afectada (actualizada)
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const res = await request(app)
                .put('/informes/1')
                .send(updatedInforme);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Informe de inventario actualizado correctamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE informe_inventario SET fecha_informe = ?, descripcion_informe = ? WHERE id_informe = ?',
                [updatedInforme.fecha_informe, updatedInforme.descripcion_informe, '1']
            );
        });

        test('Debería devolver 404 si el informe a actualizar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app)
                .put('/informes/999')
                .send({ fecha_informe: '2024-07-04', descripcion_informe: 'Informe Inexistente' });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Informe no encontrado ' });
        });

        test('Debería manejar errores al actualizar un informe', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de actualización'));

            const res = await request(app)
                .put('/informes/1')
                .send({ fecha_informe: '2024-07-04', descripcion_informe: 'Informe con Error' });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al actualizar el informe de inventario' });
        });
    });

    // Test para la ruta DELETE /informes/:id (eliminar un informe)
    describe('DELETE /informes/:id', () => {
        test('Debería eliminar un informe de inventario existente', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula que una fila fue afectada (eliminada)

            const res = await request(app).delete('/informes/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Informe eliminado correctamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM informe_inventario WHERE id_informe = ?', ['1']);
        });

        test('Debería devolver 404 si el informe a eliminar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app).delete('/informes/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Informe no encontrado' });
        });

        test('Debería manejar errores al eliminar un informe', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de eliminación'));

            const res = await request(app).delete('/informes/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al eliminar el informe' });
        });
    });
});
