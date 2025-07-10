import request from 'supertest';
import express from 'express'; // Necesitamos express para crear una app de prueba
import { jest } from '@jest/globals'; // Para mocking en ES Modules

// Mockear el módulo db.js
// Esto es crucial para que los tests no intenten conectarse a una base de datos real
jest.mock('../db.js', () => ({
  pool: {
    query: jest.fn(), // Mockea la función query del pool
  },
}));

import encuestaRoutes from '../routes/encuesta_satisfaccion.routes.js'; 

// Crea una instancia de Express para Supertest
const app = express();
app.use(express.json()); // Necesario para parsear el body en peticiones POST/PUT
app.use('/api/satisfaction', encuestaRoutes); // Monta las rutas en un prefijo

// Importa el pool mockeado para poder manipularlo en los tests
// La ruta se ajusta a '../db.js' por la misma razón que el mock
import { pool } from '../db.js';

describe('Rutas de Encuesta de Satisfacción', () => {

  // Limpia el mock de pool.query antes de cada test
  beforeEach(() => {
    pool.query.mockClear();
  });

  // Test para GET /api/satisfaction (obtener todas las encuestas)
  describe('GET /api/satisfaction', () => {
    it('debería devolver todas las encuestas de satisfacción', async () => {
      const mockSurveys = [
        { id_encuesta: 1, puntuacion: 5, comentarios: 'Excelente', fecha_encuesta: '2023-01-01' },
        { id_encuesta: 2, puntuacion: 4, comentarios: 'Bueno', fecha_encuesta: '2023-01-02' },
      ];
      // Configura el mock para que devuelva un resultado exitoso
      pool.query.mockResolvedValueOnce([mockSurveys]);

      const res = await request(app).get('/api/satisfaction');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockSurveys);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM encuesta_satisfaccion');
    });

    it('debería manejar errores al obtener todas las encuestas', async () => {
      // Configura el mock para que lance un error
      pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const res = await request(app).get('/api/satisfaction');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'al obtener las encuestas de satisfaccion' });
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM encuesta_satisfaccion');
    });
  });

  // Test para GET /api/satisfaction/:id (obtener encuesta por ID)
  describe('GET /api/satisfaction/:id', () => {
    it('debería devolver una encuesta de satisfacción por ID', async () => {
      const mockSurvey = { id_encuesta: 1, puntuacion: 5, comentarios: 'Excelente', fecha_encuesta: '2023-01-01' };
      pool.query.mockResolvedValueOnce([[mockSurvey]]); // Array anidado porque pool.query devuelve [rows, fields]

      const res = await request(app).get('/api/satisfaction/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockSurvey);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM encuesta_satisfaccion WHERE id_encuesta = ?', ['1']);
    });

    it('debería devolver 404 si la encuesta no se encuentra', async () => {
      pool.query.mockResolvedValueOnce([[]]); // No se encontraron filas

      const res = await request(app).get('/api/satisfaction/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Encuesta no encontrada' });
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM encuesta_satisfaccion WHERE id_encuesta = ?', ['999']);
    });

    it('debería manejar errores al obtener una encuesta por ID', async () => {
      pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const res = await request(app).get('/api/satisfaction/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Error al obtener la encuesta' });
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM encuesta_satisfaccion WHERE id_encuesta = ?', ['1']);
    });
  });

  // // Test para POST /api/satisfaction (crear nueva encuesta)
  // describe('POST /api/satisfaction', () => {
  //   it('debería crear una nueva encuesta de satisfacción', async () => {
  //     const newSurvey = { id_encuesta: 4, id_usuario: 1, id_pedido: 2, puntuacion: 5, comentarios: 'Muy bueno', fecha_encuesta: '2023-07-01' };
  //     // Simula el resultado de una inserción exitosa
  //     pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

  //     const res = await request(app)
  //       .post('/api/satisfaction')
  //       .send(newSurvey);

  //     expect(res.statusCode).toEqual(201);
  //     expect(res.body).toEqual({ id: 3, ...newSurvey });
  //     expect(pool.query).toHaveBeenCalledWith(
  //       'INSERT INTO encuesta_satisfaccion (id_encuesta, id_usuario, id_pedido, puntuacion, comentarios, fecha_encuesta) VALUES (?, ?, ?, ?, ?, ?)',
  //       [newSurvey.id_encuesta, newSurvey.id_usuario, newSurvey.id_pedido, newSurvey.puntuacion, newSurvey.comentarios, newSurvey.fecha_encuesta]
  //     );
  //   });

  //   it('debería devolver 400 si faltan puntuacion o comentarios', async () => {
  //     const invalidSurvey = { id_encuesta:'4', id_usuario: '2', id_pedido: '2', comentarios: 'Faltan datos', fecha_encuesta: '2023-07-01' }; 

  //     const res = await request(app)
  //       .post('/api/satisfaction')
  //       .send(invalidSurvey);

  //     expect(res.statusCode).toEqual(400);
  //     expect(res.body).toEqual({ error: 'Puntuacion y comentarios necesarios' });
  //     expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
  //   });

  //   it('debería manejar errores al crear una encuesta', async () => {
  //     const newSurvey = { id_encuesta: 4, id_usuario: 1, id_pedido: 2, puntuacion: 5, comentarios: 'Muy bueno', fecha_encuesta: '2023-07-01' };
  //     pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

  //     const res = await request(app)
  //       .post('/api/satisfaction')
  //       .send(newSurvey);

  //     expect(res.statusCode).toEqual(500);
  //     expect(res.body).toEqual({ error: 'Error al crear la encuesta de satisfaccion' });
  //     expect(pool.query).toHaveBeenCalled();
  //   });
  // });

  // // Test para PUT /api/satisfaction/:id (actualizar encuesta)
  // describe('PUT /api/satisfaction/:id', () => {
  //   it('debería actualizar una encuesta de satisfacción existente', async () => {
  //     const updatedSurvey = { puntuacion: 4, comentarios: 'Mejorado', fecha_encuesta: '2023-07-02' };
  //     // Simula el resultado de una actualización exitosa (affectedRows > 0)
  //     pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

  //     const res = await request(app)
  //       .put('/api/satisfaction/1')
  //       .send(updatedSurvey);

  //     expect(res.statusCode).toEqual(200);
  //     expect(res.body).toEqual({ message: 'Encuesta de satisfaccion actualizada correctamente' });
  //     expect(pool.query).toHaveBeenCalledWith(
  //       'UPDATE encuesta_satisfaccion SET puntuacion = ?, comentarios = ?, fecha_encuesta = ? WHERE id_encuesta = ?',
  //       [updatedSurvey.puntuacion, updatedSurvey.comentarios, updatedSurvey.fecha_encuesta, '1']
  //     );
  //   });

  //   it('debería devolver 404 si la encuesta a actualizar no se encuentra', async () => {
  //     const updatedSurvey = { puntuacion: 4, comentarios: 'Mejorado', fecha_encuesta: '2023-07-02' };
  //     pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // No se afectaron filas

  //     const res = await request(app)
  //       .put('/api/satisfaction/999')
  //       .send(updatedSurvey);

  //     expect(res.statusCode).toEqual(404);
  //     expect(res.body).toEqual({ error: 'Encuesta no encontrada ' }); // Nota el espacio al final del mensaje
  //     expect(pool.query).toHaveBeenCalled();
  //   });

  //   it('debería manejar errores al actualizar una encuesta', async () => {
  //     const updatedSurvey = { puntuacion: 4, comentarios: 'Mejorado', fecha_encuesta: '2023-07-02' };
  //     pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

  //     const res = await request(app)
  //       .put('/api/satisfaction/1')
  //       .send(updatedSurvey);

  //     expect(res.statusCode).toEqual(500);
  //     expect(res.body).toEqual({ error: 'Error al actualizar el producto' }); // El mensaje de error es "producto" en tu código original
  //     expect(pool.query).toHaveBeenCalled();
  //   });
  // });

  // // Test para DELETE /api/satisfaction/:id (eliminar encuesta)
  // describe('DELETE /api/satisfaction/:id', () => {
  //   it('debería eliminar una encuesta de satisfacción existente', async () => {
  //     pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula eliminación exitosa

  //     const res = await request(app).delete('/api/satisfaction/1');

  //     expect(res.statusCode).toEqual(200);
  //     expect(res.body).toEqual({ message: 'Encuesta eliminada correctamente' });
  //     expect(pool.query).toHaveBeenCalledWith('DELETE FROM encuesta_satisfaccion WHERE id_encuesta = ?', ['1']);
  //   });

  //   it('debería devolver 404 si la encuesta a eliminar no se encuentra', async () => {
  //     pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // No se afectaron filas

  //     const res = await request(app).delete('/api/satisfaction/999');

  //     expect(res.statusCode).toEqual(404);
  //     expect(res.body).toEqual({ error: 'Encuesta no encontrada' });
  //     expect(pool.query).toHaveBeenCalled();
  //   });

  //   it('debería manejar errores al eliminar una encuesta', async () => {
  //     pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

  //     const res = await request(app).delete('/api/satisfaction/1');

  //     expect(res.statusCode).toEqual(500);
  //     expect(res.body).toEqual({ error: 'Error al eliminar la encuesta' });
  //     expect(pool.query).toHaveBeenCalled();
  //   });
  // });
});