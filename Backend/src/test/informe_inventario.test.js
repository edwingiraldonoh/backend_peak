// Import necessary libraries for testing
import request from 'supertest';
import express from 'express';
import { pool } from '../db.js'; // Ensure the path to your db.js file is correct

// Import the router you want to test
import informeRoutes from '../routes/informe_inventario.Routes.js'; // Ensure the path is correct

// Mock the 'db.js' module to control database responses
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(), // Mock the query function of the pool
    },
}));

// Create an Express application for testing
const app = express();
app.use(express.json()); // Enable JSON body parsing for requests
app.use('/api/informe_inventario', informeRoutes); // Mount the router on a base path

describe('API de Informe de Inventario', () => {
    // Clear mocks before each test
    beforeEach(() => {
        pool.query.mockClear();
    });

    // Test for getting all inventory reports
    describe('GET /api/informe_inventario', () => {
        test('Should get all inventory reports', async () => {
            // Configure the mock to return inventory report data
            pool.query.mockResolvedValueOnce([[{ id_informe: 1, descripcion_informe: 'Informe mensual' }]]);

            // Make the GET request
            const res = await request(app).get('/api/informe_inventario');

            // Verify assertions
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([{ id_informe: 1, descripcion_informe: 'Informe mensual' }]);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM informe_inventario');
        });

        test('Should handle errors when getting inventory reports', async () => {
            // Configure the mock to throw an error
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            // Make the GET request
            const res = await request(app).get('/api/informe_inventario');

            // Verify assertions
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'al obtener las encuestas de satisfaccion' }); // Note: This error message seems to be a copy-paste error from another route, it should ideally be 'al obtener los informes de inventario'
        });
    });

    // Test for getting an inventory report by ID
    describe('GET /api/informe_inventario/:id', () => {
        test('Should get an inventory report by ID', async () => {
            // Configure the mock to return a specific inventory report
            pool.query.mockResolvedValueOnce([[{ id_informe: 4, descripcion_informe: 'Informe mensual' }]]);

            // Make the GET request
            const res = await request(app).get('/api/informe_inventario/4');

            // Verify assertions
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ id_informe: 4, descripcion_informe: 'Informe mensual' });
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM informe_inventario WHERE id_informe = ?', ['4']);
        });

        test('Should return 404 if the inventory report is not found', async () => {
            // Configure the mock to return an empty array (report not found)
            pool.query.mockResolvedValueOnce([[]]);

            // Make the GET request
            const res = await request(app).get('/api/informe_inventario/999');

            // Verify assertions
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Informe no encontrado' });
        });

        test('Should handle errors when getting an inventory report by ID', async () => {
            // Configure the mock to throw an error
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            // Make the GET request
            const res = await request(app).get('/api/informe_inventario/4');

            // Verify assertions
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al obtener el informe' });
        });
    });

    // Test for creating a new inventory report
    describe('POST /api/informe_inventario', () => {
        const newInforme = {
            id_informe: 4,
            id_inventario: 1,
            fecha_informe: '2023-07-22',
            descripcion_informe: 'Nuevo informe de inventario'
        };

        test('Should create a new inventory report', async () => {
            // Configure the mock to simulate a successful insertion
            pool.query.mockResolvedValueOnce([{ insertId: 4 }]);

            // Make the POST request
            const res = await request(app)
                .post('/api/informe_inventario')
                .send(newInforme);

            // Verify assertions
            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual({ id: 4, ...newInforme });
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO informe_inventario (id_informe, id_inventario, fecha_informe, descripcion_informe) VALUES (?, ?, ?, ?)',
                [newInforme.id_informe, newInforme.id_inventario, newInforme.fecha_informe, newInforme.descripcion_informe]
            );
        });

        test('Should return 400 if required fields are missing', async () => {
            // Send an object with some required fields missing
            const incompleteInforme = {
                id_inventario: 100,
                fecha_informe: '2023-07-22'
            };

            // Make the POST request
            const res = await request(app)
                .post('/api/informe_inventario')
                .send(incompleteInforme);

            // Verify assertions
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'La descripcion es necesaria' });
        });

        test('Should handle errors when creating an inventory report', async () => {
            // Configure the mock to throw an error
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            // Make the POST request
            const res = await request(app)
                .post('/api/informe_inventario')
                .send(newInforme);

            // Verify assertions
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al crear la descripcion del informe' });
        });
    });

    // Test for updating an existing inventory report
    describe('PUT /api/informe_inventario/:id', () => {
        const updatedInforme = {
            id_inventario: 1,
            fecha_informe: '2023-07-23',
            descripcion_informe: 'Informe de inventario actualizado'
        };

        test('Should update an existing inventory report', async () => {
            // Configure the mock to simulate a successful update
            pool.query.mockResolvedValueOnce([{ affectedRows: 4 }]);

            // Make the PUT request
            const res = await request(app)
                .put('/api/informe_inventario/4')
                .send(updatedInforme);

            // Verify assertions
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Informe de inventario actualizado correctamente' });
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE informe_inventario SET id_inventario = ?, fecha_informe = ?, descripcion_informe = ? WHERE id_informe = ?',
                [updatedInforme.id_inventario, updatedInforme.fecha_informe, updatedInforme.descripcion_informe, '4']
            );
        });

        test('Should return 404 if the inventory report to update is not found', async () => {
            // Configure the mock to simulate that the report was not found
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            // Make the PUT request
            const res = await request(app)
                .put('/api/informe_inventario/999')
                .send(updatedInforme);

            // Verify assertions
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Informe no encontrado '});
        });

        test('Should handle errors when updating an inventory report', async () => {
            // Configure the mock to throw an error
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            // Make the PUT request
            const res = await request(app)
                .put('/api/informe_inventario/4')
                .send(updatedInforme);

            // Verify assertions
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al actualizar el informe de inventario' });
        });
    });

    // Test for deleting an inventory report
    describe('DELETE /api/informe_inventario/:id', () => {
        test('Should delete an inventory report', async () => {
            // Configure the mock to simulate a successful deletion
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            // Make the DELETE request
            const res = await request(app).delete('/api/informe_inventario/4');

            // Verify assertions
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Informe eliminado correctamente' });
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM informe_inventario WHERE id_informe = ?', ['4']);
        });

        test('Should return 404 if the inventory report to delete is not found', async () => {
            // Configure the mock to simulate that the report was not found
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            // Make the DELETE request
            const res = await request(app).delete('/api/informe_inventario/999');

            // Verify assertions
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Informe no encontrado' });
        });

        test('Should handle errors when deleting an inventory report', async () => {
            // Configure the mock to throw an error
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            // Make the DELETE request
            const res = await request(app).delete('/api/informe_inventario/4');

            // Verify assertions
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al eliminar el informe' });
        });
    });
});