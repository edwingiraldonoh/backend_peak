import request from 'supertest';
import app from '../../index.js'; // Adjust the path to your app.js or index.js
import { pool } from '../db.js'; // Adjust the path to your db.js

// Mock the entire db.js module
jest.mock('../db.js', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('Satisfaction API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    pool.query.mockClear();
  });

  // --- GET /satisfaction ---
  describe('GET /satisfaction', () => {
    test('should return all satisfaction surveys', async () => {
      const mockSurveys = [{ id_encuesta: 1, puntuacion: 5, comentarios: 'Excellent' }];
      pool.query.mockResolvedValueOnce([mockSurveys]);

      const res = await request(app).get('/satisfaction');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockSurveys);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM encuesta_satisfaccion');
    });

    test('should handle errors when getting all surveys', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/satisfaction');
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'al obtener las encuestas de satisfaccion' });
    });
  });

//   // --- GET /satisfaction/:id_encuesta ---
//   describe('GET /satisfaction/:id_encuesta', () => {
//     test('should return a single satisfaction survey by ID', async () => {
//       const mockSurvey = { id_encuesta: 1, puntuacion: 4, comentarios: 'Good service' };
//       pool.query.mockResolvedValueOnce([mockSurvey]);

//       const res = await request(app).get('/satisfaction/1');
//       expect(res.statusCode).toEqual(200);
//       expect(res.body).toEqual(mockSurvey);
//       expect(pool.query).toHaveBeenCalledWith('SELECT * FROM encuesta_satisfaccion WHERE id_encuesta = ?', [1]);
//     });

//     test('should return 404 if survey not found', async () => {
//       pool.query.mockResolvedValueOnce([[]]); // No rows found

//       const res = await request(app).get('/satisfaction/999');
//       expect(res.statusCode).toEqual(404);
//       expect(res.body).toEqual({ error: 'Encuesta no encontrada' });
//     });

//     test('should handle errors when getting a survey by ID', async () => {
//       pool.query.mockRejectedValueOnce(new Error('Database error'));

//       const res = await request(app).get('/satisfaction/1');
//       expect(res.statusCode).toEqual(500);
//       expect(res.body).toEqual({ error: 'Error al obtener la encuesta' });
//     });
//   });

//   // --- POST /satisfaction ---
//   describe('POST /satisfaction', () => {
//     test('should create a new satisfaction survey', async () => {
//       const newSurvey = { puntuacion: 5, comentarios: 'Amazing experience!' };
//       const insertResult = { insertId: 101 };
//       pool.query.mockResolvedValueOnce([insertResult]);

//       const res = await request(app)
//         .post('/satisfaction')
//         .send(newSurvey);

//       expect(res.statusCode).toEqual(201);
//       expect(res.body).toEqual({ id: insertResult.insertId, ...newSurvey });
//       expect(pool.query).toHaveBeenCalledWith(
//         'INSERT INTO encuesta_satisfaccion (puntuacion, comentarios) VALUES (?, ?)',
//         [newSurvey.puntuacion, newSurvey.comentarios]
//       );
//     });

//     test('should return 400 if puntuacion is missing', async () => {
//       const newSurvey = { comentarios: 'Missing score' };

//       const res = await request(app)
//         .post('/satisfaction')
//         .send(newSurvey);

//       expect(res.statusCode).toEqual(400);
//       expect(res.body).toEqual({ error: 'Puntuacion y comentarios necesarios' });
//     });

//     test('should return 400 if comentarios is missing', async () => {
//       const newSurvey = { puntuacion: 3 };

//       const res = await request(app)
//         .post('/satisfaction')
//         .send(newSurvey);

//       expect(res.statusCode).toEqual(400);
//       expect(res.body).toEqual({ error: 'Puntuacion y comentarios necesarios' });
//     });

//     test('should handle errors when creating a survey', async () => {
//       const newSurvey = { puntuacion: 4, comentarios: 'Some comments' };
//       pool.query.mockRejectedValueOnce(new Error('Database error'));

//       const res = await request(app)
//         .post('/satisfaction')
//         .send(newSurvey);

//       expect(res.statusCode).toEqual(500);
//       expect(res.body).toEqual({ error: 'Error al crear la encuesta de satisfaccion' });
//     });
//   });

//   // --- PUT /satisfaction/:id_encuesta ---
//   describe('PUT /satisfaction/:id_encuesta', () => {
//     test('should update an existing satisfaction survey', async () => {
//       const updatedSurvey = { puntuacion: 5, comentarios: 'Updated excellent review' };
//       const updateResult = { affectedRows: 1 };
//       pool.query.mockResolvedValueOnce([updateResult]);

//       const res = await request(app)
//         .put('/satisfaction/1')
//         .send(updatedSurvey);

//       expect(res.statusCode).toEqual(200);
//       expect(res.body).toEqual({ message: 'Encuesta de satisfaccion actualizada correctamente' });
//       expect(pool.query).toHaveBeenCalledWith(
//         'UPDATE encuesta_satisfaccion SET puntuacion = ?, comentarios = ? WHERE id_encuesta = ?',
//         [updatedSurvey.puntuacion, updatedSurvey.comentarios, 1]
//       );
//     });

//     test('should return 404 if survey to update is not found', async () => {
//       const updatedSurvey = { puntuacion: 5, comentarios: 'Updated review' };
//       const updateResult = { affectedRows: 0 }; // No rows affected
//       pool.query.mockResolvedValueOnce([updateResult]);

//       const res = await request(app)
//         .put('/satisfaction/999')
//         .send(updatedSurvey);

//       expect(res.statusCode).toEqual(404);
//       expect(res.body).toEqual({ error: 'Encuesta no encontrada ' });
//     });

//     test('should handle errors when updating a survey', async () => {
//       const updatedSurvey = { puntuacion: 3, comentarios: 'Updated comments' };
//       pool.query.mockRejectedValueOnce(new Error('Database error'));

//       const res = await request(app)
//         .put('/satisfaction/1')
//         .send(updatedSurvey);

//       expect(res.statusCode).toEqual(500);
//       expect(res.body).toEqual({ error: 'Error al actualizar el producto' });
//     });
//   });

//   // --- DELETE /satisfaction/:id_encuesta ---
//   describe('DELETE /satisfaction/:id_encuesta', () => {
//     test('should delete a satisfaction survey', async () => {
//       const deleteResult = { affectedRows: 1 };
//       pool.query.mockResolvedValueOnce([deleteResult]);

//       const res = await request(app).delete('/satisfaction/1');

//       expect(res.statusCode).toEqual(200);
//       expect(res.body).toEqual({ message: 'Encuesta eliminada correctamente' });
//       expect(pool.query).toHaveBeenCalledWith('DELETE FROM encuesta_satisfaccion WHERE id_encuesta = ?', [1]);
//     });

//     test('should return 404 if survey to delete is not found', async () => {
//       const deleteResult = { affectedRows: 0 }; // No rows affected
//       pool.query.mockResolvedValueOnce([deleteResult]);

//       const res = await request(app).delete('/satisfaction/999');

//       expect(res.statusCode).toEqual(404);
//       expect(res.body).toEqual({ error: 'Encuesta no encontrada' });
//     });

//     test('should handle errors when deleting a survey', async () => {
//       pool.query.mockRejectedValueOnce(new Error('Database error'));

//       const res = await request(app).delete('/satisfaction/1');

//       expect(res.statusCode).toEqual(500);
//       expect(res.body).toEqual({ error: 'Error al eliminar la encuesta' });
//     });
//   });
});