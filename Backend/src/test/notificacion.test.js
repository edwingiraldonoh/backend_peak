import request from 'supertest';
import express from 'express';
import { pool } from '../db.js'; 
import notificacionRoutes from '../routes/notificacion.routes.js';

// Mockea el módulo 'db.js' para controlar el comportamiento de la base de datos
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(),
    },
}));

// Crea una aplicación Express para testear el router
const app = express();
app.use(express.json()); // Necesario para parsear el body de las peticiones
app.use('/notificaciones', notificacionRoutes); // Monta el router en una ruta base

describe('notificacion.routes.js', () => {
    // Limpia los mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // // Test para la ruta GET /notificaciones (obtener todas las notificaciones)
    // describe('GET /notificaciones', () => {
    //     test('Debería obtener todas las notificaciones', async () => {
    //         // Datos de ejemplo que el mock de pool.query devolverá
    //         const mockNotificaciones = [
    //             { id_notificacion: 1, mensaje_notificacion: 'Mensaje 1', fecha_notificacion: '2024-01-01', estado_notificacion: 'enviado', destinatario: 'usuario1' },
    //             { id_notificacion: 2, mensaje_notificacion: 'Mensaje 2', fecha_notificacion: '2024-01-02', estado_notificacion: 'pendiente', destinatario: 'usuario2' },
    //         ];
    //         // Configura el mock para que devuelva los datos esperados
    //         pool.query.mockResolvedValueOnce([mockNotificaciones]);

    //         // Realiza la petición GET
    //         const res = await request(app).get('/notificaciones');

    //         // Afirmaciones
    //         expect(res.statusCode).toEqual(200); // Espera un status 200 OK
    //         expect(res.body).toEqual(mockNotificaciones); // Espera que el cuerpo de la respuesta sea igual a los datos mockeados
    //         expect(pool.query).toHaveBeenCalledTimes(1); // Espera que pool.query haya sido llamado una vez
    //         expect(pool.query).toHaveBeenCalledWith('SELECT * FROM notificacion'); // Espera que la consulta sea la correcta
    //     });

    //     test('Debería manejar errores al obtener todas las notificaciones', async () => {
    //         // Configura el mock para que rechace la promesa con un error
    //         pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

    //         // Realiza la petición GET
    //         const res = await request(app).get('/notificaciones');

    //         // Afirmaciones
    //         expect(res.statusCode).toEqual(500); // Espera un status 500 Internal Server Error
    //         expect(res.body).toEqual({ error: 'al obtener los datos de la notificacion' }); // Espera el mensaje de error específico
    //     });
    // });

    // // Test para la ruta GET /notificaciones/:id (obtener notificación por ID)
    // describe('GET /notificaciones/:id', () => {
    //     test('Debería obtener una notificación por ID', async () => {
    //         const mockNotificacion = { id_notificacion: 1, mensaje_notificacion: 'Mensaje 1', fecha_notificacion: '2024-01-01', estado_notificacion: 'enviado', destinatario: 'usuario1' };
    //         pool.query.mockResolvedValueOnce([[mockNotificacion]]); // Nota el doble array para simular rows[0]

    //         const res = await request(app).get('/notificaciones/1');

    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toEqual(mockNotificacion);
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         expect(pool.query).toHaveBeenCalledWith('SELECT * FROM notificacion WHERE id_notificacion = ?', ['1']);
    //     });

    //     test('Debería devolver 404 si la notificación no se encuentra', async () => {
    //         pool.query.mockResolvedValueOnce([[]]); // Simula que no se encontraron filas

    //         const res = await request(app).get('/notificaciones/999');

    //         expect(res.statusCode).toEqual(404);
    //         expect(res.body).toEqual({ error: 'notificacion no encontrada' });
    //     });

    //     test('Debería manejar errores al obtener la notificación por ID', async () => {
    //         pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

    //         const res = await request(app).get('/notificaciones/1');

    //         expect(res.statusCode).toEqual(500);
    //         expect(res.body).toEqual({ error: 'Error al obtener la notificacion' });
    //     });
    // });

    // // Test para la ruta POST /notificaciones (crear una nueva notificación)
    // describe('POST /notificaciones', () => {
    //     test('Debería crear una nueva notificación', async () => {
    //         const newNotificacion = { mensaje_notificacion: 'Nuevo mensaje', fecha_notificacion: '2024-07-03', estado_notificacion: 'creado', destinatario: 'usuario3' };
    //         // Simula el resultado de una inserción en la base de datos
    //         pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

    //         const res = await request(app)
    //             .post('/notificaciones')
    //             .send(newNotificacion);

    //         expect(res.statusCode).toEqual(201); // Espera un status 201 Created
    //         expect(res.body).toEqual({ id: 3, ...newNotificacion }); // Espera el ID insertado y los datos de la notificación
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         expect(pool.query).toHaveBeenCalledWith(
    //             'INSERT INTO notificacion (mensaje_notificacion, fecha_notificacion, estado_notificacion, destinatario) VALUES (?, ?, ?)',
    //             [newNotificacion.mensaje_notificacion, newNotificacion.fecha_notificacion, newNotificacion.estado_notificacion, newNotificacion.destinatario]
    //         );
    //     });

    //     test('Debería devolver 400 si faltan campos requeridos', async () => {
    //         const incompleteNotificacion = { mensaje_notificacion: 'Mensaje incompleto' }; // Faltan fecha_notificacion, estado_notificacion, destinatario

    //         const res = await request(app)
    //             .post('/notificaciones')
    //             .send(incompleteNotificacion);

    //         expect(res.statusCode).toEqual(400);
    //         expect(res.body).toEqual({ error: 'Datos requeridos obligatoriamente' });
    //         expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
    //     });

    //     test('Debería manejar errores al crear una notificación', async () => {
    //         const newNotificacion = { mensaje_notificacion: 'Mensaje con error', fecha_notificacion: '2024-07-03', estado_notificacion: 'fallido', destinatario: 'usuario4' };
    //         pool.query.mockRejectedValueOnce(new Error('Error de inserción'));

    //         const res = await request(app)
    //             .post('/notificaciones')
    //             .send(newNotificacion);

    //         expect(res.statusCode).toEqual(500);
    //         expect(res.body).toEqual({ error: 'Error al crear la notificacion' });
    //     });
    // });

    // // Test para la ruta PUT /notificaciones/:id (actualizar una notificación)
    // describe('PUT /notificaciones/:id', () => {
    //     test('Debería actualizar una notificación existente', async () => {
    //         const updatedNotificacion = { mensaje_notificacion: 'Mensaje actualizado', fecha_notificacion: '2024-07-04', estado_notificacion: 'leido', destinatario: 'usuario1' };
    //         // Simula que una fila fue afectada (actualizada)
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //         const res = await request(app)
    //             .put('/notificaciones/1')
    //             .send(updatedNotificacion);

    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toEqual({ message: 'Notificacion actualizada correctamente' });
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         expect(pool.query).toHaveBeenCalledWith(
    //             'UPDATE notificacion SET mensaje_notificacion = ?, fecha_notificacion = ?, estado_notificacion = ?, destinatario = ? WHERE id_notificacion = ?',
    //             [updatedNotificacion.mensaje_notificacion, updatedNotificacion.fecha_notificacion, updatedNotificacion.estado_notificacion, updatedNotificacion.destinatario, '1']
    //         );
    //     });

    //     test('Debería devolver 404 si la notificación a actualizar no se encuentra', async () => {
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

    //         const res = await request(app)
    //             .put('/notificaciones/999')
    //             .send({ mensaje_notificacion: 'Mensaje inexistente', fecha_notificacion: '2024-07-04', estado_notificacion: 'borrador', destinatario: 'usuarioX' });

    //         expect(res.statusCode).toEqual(404);
    //         expect(res.body).toEqual({ error: 'Notificacion no encontrada ' });
    //     });

    //     test('Debería manejar errores al actualizar una notificación', async () => {
    //         pool.query.mockRejectedValueOnce(new Error('Error de actualización'));

    //         const res = await request(app)
    //             .put('/notificaciones/1')
    //             .send({ mensaje_notificacion: 'Mensaje con error', fecha_notificacion: '2024-07-04', estado_notificacion: 'error', destinatario: 'usuario1' });

    //         expect(res.statusCode).toEqual(500);
    //         expect(res.body).toEqual({ error: 'Error al actualizar la notificacion' });
    //     });
    // });

    // // Test para la ruta DELETE /notificaciones/:id (eliminar una notificación)
    // describe('DELETE /notificaciones/:id', () => {
    //     test('Debería eliminar una notificación existente', async () => {
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula que una fila fue afectada (eliminada)

    //         const res = await request(app).delete('/notificaciones/1');

    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toEqual({ message: 'Notificacion eliminada corectamente' });
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         expect(pool.query).toHaveBeenCalledWith('DELETE FROM notificacion WHERE id_notificacion = ?', ['1']);
    //     });

    //     test('Debería devolver 404 si la notificación a eliminar no se encuentra', async () => {
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

    //         const res = await request(app).delete('/notificaciones/999');

    //         expect(res.statusCode).toEqual(404);
    //         expect(res.body).toEqual({ error: 'Notificacion no encontrada' });
    //     });

    //     test('Debería manejar errores al eliminar una notificación', async () => {
    //         pool.query.mockRejectedValueOnce(new Error('Error de eliminación'));

    //         const res = await request(app).delete('/notificaciones/1');

    //         expect(res.statusCode).toEqual(500);
    //         expect(res.body).toEqual({ error: 'Error al eliminar la notificacion' });
    //     });
    // });
});