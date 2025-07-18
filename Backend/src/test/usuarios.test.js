// Importa Supertest para realizar solicitudes HTTP a tu aplicación Express
import request from 'supertest';
// Importa Express para crear una instancia de tu aplicación
import express from 'express';
// Importa el router de usuarios que quieres probar
import usuariosRoutes from '../../src/routes/usuarios.routes.js';

// Mockea el módulo db.js para evitar conexiones a la base de datos real
// Esto es crucial para que tus tests sean rápidos y aislados
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(), // Simula la función query del pool de la base de datos
    },
}));

// Mockea el módulo encrypting.js para simular la función hash
jest.mock('../encrypting.js', () => ({
    hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)), // Simula el hash de contraseñas
}));

// Importa el pool mockeado después de haberlo definido
import { pool } from '../db.js';
// Importa la función hash mockeada
import { hash } from '../encrypting.js';

// Crea una aplicación Express de prueba
const app = express();
// Usa el middleware para parsear JSON en las solicitudes
app.use(express.json());
// Monta el router de usuarios en la ruta /api/usuarios
app.use('/api/usuarios', usuariosRoutes);

// Describe el conjunto de tests para el router de usuarios
describe('usuarios.routes.js', () => {
    // Antes de cada test, limpia los mocks para asegurar un estado limpio
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test para obtener todos los usuarios
    describe('GET /api/usuarios', () => {
        test('debería devolver todos los usuarios', async () => {
            // Datos de usuarios simulados para la respuesta de la base de datos
            const mockUsers = [{ id_usuario: 1, nombre_usuario: 'Juan' }, { id_usuario: 2, nombre_usuario: 'Maria' }];
            // Configura el mock de pool.query para que devuelva los usuarios simulados
            pool.query.mockResolvedValueOnce([mockUsers]);

            // Realiza una solicitud GET a /api/usuarios
            const res = await request(app).get('/api/usuarios');

            // Verifica que el estado de la respuesta sea 200 (OK)
            expect(res.statusCode).toEqual(200);
            // Verifica que el cuerpo de la respuesta sea igual a los usuarios simulados
            expect(res.body).toEqual(mockUsers);
            // Verifica que pool.query haya sido llamado una vez
            expect(pool.query).toHaveBeenCalledTimes(1);
            // Verifica que pool.query haya sido llamado con la consulta correcta
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM usuarios');
        });

        test('debería manejar errores al obtener usuarios', async () => {
            // Simula un error en la base de datos
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            // Realiza una solicitud GET a /api/usuarios
            const res = await request(app).get('/api/usuarios');

            // Verifica que el estado de la respuesta sea 500 (Error interno del servidor)
            expect(res.statusCode).toEqual(500);
            // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
            expect(res.body).toEqual({ error: 'al obtener los datos del usuario' });
        });
    });

    // Test para obtener un usuario por ID
    describe('GET /api/usuarios/:id', () => {
        test('debería devolver un usuario por ID', async () => {
            // Datos de un usuario simulado
            const mockUser = { id_usuario: 1, nombre_usuario: 'Juan' };
            // Configura el mock de pool.query para que devuelva el usuario simulado
            pool.query.mockResolvedValueOnce([[mockUser]]);

            // Realiza una solicitud GET a /api/usuarios/1
            const res = await request(app).get('/api/usuarios/1');

            // Verifica que el estado de la respuesta sea 200 (OK)
            expect(res.statusCode).toEqual(200);
            // Verifica que el cuerpo de la respuesta sea igual al usuario simulado
            expect(res.body).toEqual(mockUser);
            // Verifica que pool.query haya sido llamado una vez
            expect(pool.query).toHaveBeenCalledTimes(1);
            // Verifica que pool.query haya sido llamado con la consulta y el ID correctos
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM usuarios WHERE id_usuario = ?', ['1']);
        });

        test('debería devolver 404 si el usuario no es encontrado', async () => {
            // Configura el mock de pool.query para que devuelva un array vacío (usuario no encontrado)
            pool.query.mockResolvedValueOnce([[]]);

            // Realiza una solicitud GET a /api/usuarios/999
            const res = await request(app).get('/api/usuarios/999');

            // Verifica que el estado de la respuesta sea 404 (No encontrado)
            expect(res.statusCode).toEqual(404);
            // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
            expect(res.body).toEqual({ error: 'Usuario no encontrado' });
        });

        test('debería manejar errores al obtener un usuario por ID', async () => {
            // Simula un error en la base de datos
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            // Realiza una solicitud GET a /api/usuarios/1
            const res = await request(app).get('/api/usuarios/1');

            // Verifica que el estado de la respuesta sea 500 (Error interno del servidor)
            expect(res.statusCode).toEqual(500);
            // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
            expect(res.body).toEqual({ error: 'Error al obtener el usuario' });
        });
    });

    // // Test para crear un nuevo usuario
    // describe('POST /api/usuarios', () => {
    //     const newUser = {
    //         nombre_usuario: 'Nuevo',
    //         apellido_usuario: 'Usuario',
    //         estado: 'activo',
    //         contraseña: 'password123',
    //         correo_electronico: 'nuevo.usuario@example.com',
    //         telefono: '123456789',
    //         fecha_creacion: '2023-01-01',
    //         fecha_modificacion: '2023-01-01'
    //     };

    //     test('debería crear un nuevo usuario', async () => {
    //         // Configura el mock de pool.query para simular una inserción exitosa
    //         pool.query.mockResolvedValueOnce([{ insertId: 4 }]);
    //         // Configura el mock de hash para devolver un hash predecible
    //         hash.mockResolvedValueOnce('hashed_password123');

    //         // Realiza una solicitud POST a /api/usuarios con los datos del nuevo usuario
    //         const res = await request(app).post('/api/usuarios').send(newUser);

    //         // Verifica que el estado de la respuesta sea 201 (Creado)
    //         expect(res.statusCode).toEqual(201);
    //         // Verifica que el cuerpo de la respuesta contenga el ID insertado y los datos del usuario
    //         expect(res.body).toEqual({
    //             id: 4,
    //             nombre_usuario: newUser.nombre_usuario,
    //             apellido_usuario: newUser.apellido_usuario,
    //             passHash: 'hashed_password123', // Espera el hash simulado
    //             correo_electronico: newUser.correo_electronico,
    //             telefono: newUser.telefono,
    //             fecha_creacion: newUser.fecha_creacion,
    //             fecha_modificacion: newUser.fecha_modificacion
    //         });
    //         // Verifica que pool.query haya sido llamado una vez
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         // Verifica que hash haya sido llamado una vez con la contraseña correcta
    //         expect(hash).toHaveBeenCalledWith(newUser.contraseña);
    //         // Verifica que pool.query haya sido llamado con la consulta y los valores correctos
    //         expect(pool.query).toHaveBeenCalledWith(
    //             'INSERT INTO usuarios (nombre_usuario, apellido_usuario, estado, contraseña, correo_electronico, telefono, fecha_creacion, fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
    //             [
    //                 newUser.nombre_usuario,
    //                 newUser.apellido_usuario,
    //                 'hashed_password123', // Asegúrate de que el hash simulado se pasa aquí
    //                 newUser.correo_electronico,
    //                 newUser.telefono,
    //                 newUser.fecha_creacion,
    //                 newUser.fecha_modificacion
    //             ]
    //         );
    //     });

    //     test('debería devolver 400 si faltan datos requeridos', async () => {
    //         // Datos incompletos del usuario (sin nombre_usuario)
    //         const incompleteUser = {
    //             apellido_usuario: 'Usuario',
    //             estado: 'activo',
    //             contraseña: 'password123',
    //             correo_electronico: 'nuevo.usuario@example.com',
    //             telefono: '123456789',
    //             fecha_creacion: '2023-01-01',
    //             fecha_modificacion: '2023-01-01'
    //         };

    //         // Realiza una solicitud POST con datos incompletos
    //         const res = await request(app).post('/api/usuarios').send(incompleteUser);

    //         // Verifica que el estado de la respuesta sea 400 (Solicitud incorrecta)
    //         expect(res.statusCode).toEqual(400);
    //         // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
    //         expect(res.body).toEqual({ error: 'Datos requeridos obligatoriamente' });
    //         // Verifica que pool.query no haya sido llamado, ya que la validación falló antes
    //         expect(pool.query).not.toHaveBeenCalled();
    //     });

    //     test('debería manejar errores al crear un usuario', async () => {
    //         // Simula un error en la base de datos
    //         pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));
    //         // Configura el mock de hash para devolver un hash predecible
    //         hash.mockResolvedValueOnce('hashed_password123');


    //         // Realiza una solicitud POST con datos de usuario válidos
    //         const res = await request(app).post('/api/usuarios').send(newUser);

    //         // Verifica que el estado de la respuesta sea 500 (Error interno del servidor)
    //         expect(res.statusCode).toEqual(500);
    //         // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
    //         expect(res.body).toEqual({ error: 'Error al crear el usuario' });
    //     });
    // });

    // // Test para actualizar un usuario existente
    // describe('PUT /api/usuarios/:id', () => {
    //     const updatedUser = {
    //         nombre_usuario: 'UsuarioActualizado',
    //         apellido_usuario: 'ApellidoActualizado',
    //         contraseña: 'newpassword',
    //         correo_electronico: 'updated.user@example.com',
    //         telefono: '987654321',
    //         fecha_creacion: '2023-01-01',
    //         fecha_modificacion: '2023-01-02'
    //     };

    //     test('debería actualizar un usuario existente', async () => {
    //         // Configura el mock de pool.query para simular una actualización exitosa (1 fila afectada)
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //         // Realiza una solicitud PUT a /api/usuarios/1 con los datos actualizados
    //         const res = await request(app).put('/api/usuarios/1').send(updatedUser);

    //         // Verifica que el estado de la respuesta sea 200 (OK)
    //         expect(res.statusCode).toEqual(200);
    //         // Verifica que el cuerpo de la respuesta contenga el mensaje de éxito
    //         expect(res.body).toEqual({ message: 'Usuario actualizado correctamente' });
    //         // Verifica que pool.query haya sido llamado una vez
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         // Verifica que pool.query haya sido llamado con la consulta y los valores correctos
    //         expect(pool.query).toHaveBeenCalledWith(
    //             'UPDATE usuarios SET nombre_usuario = ?, apellido_usuario = ?, contraseña = ?, correo_electonico = ?, telefono = ?, fecha_creacion = ?, fecha_modificacion = ? WHERE id_usuario = ?',
    //             [
    //                 updatedUser.nombre_usuario,
    //                 updatedUser.apellido_usuario,
    //                 updatedUser.contraseña,
    //                 updatedUser.correo_electronico,
    //                 updatedUser.telefono,
    //                 updatedUser.fecha_creacion,
    //                 updatedUser.fecha_modificacion,
    //                 '1'
    //             ]
    //         );
    //     });

    //     test('debería devolver 404 si el usuario a actualizar no es encontrado', async () => {
    //         // Configura el mock de pool.query para simular que no se afectó ninguna fila (usuario no encontrado)
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    //         // Realiza una solicitud PUT a /api/usuarios/999 con los datos actualizados
    //         const res = await request(app).put('/api/usuarios/999').send(updatedUser);

    //         // Verifica que el estado de la respuesta sea 404 (No encontrado)
    //         expect(res.statusCode).toEqual(404);
    //         // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
    //         expect(res.body).toEqual({ error: 'Usuario no encontrado ' });
    //     });

    //     test('debería manejar errores al actualizar un usuario', async () => {
    //         // Simula un error en la base de datos
    //         pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

    //         // Realiza una solicitud PUT con datos de usuario válidos
    //         const res = await request(app).put('/api/usuarios/1').send(updatedUser);

    //         // Verifica que el estado de la respuesta sea 500 (Error interno del servidor)
    //         expect(res.statusCode).toEqual(500);
    //         // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
    //         expect(res.body).toEqual({ error: 'Error al actualizar el usuario' });
    //     });
    // });

    // Test para eliminar un usuario
    describe('DELETE /api/usuarios/:id', () => {
        test('debería eliminar un usuario existente', async () => {
            // Configura el mock de pool.query para simular una eliminación exitosa (1 fila afectada)
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            // Realiza una solicitud DELETE a /api/usuarios/1
            const res = await request(app).delete('/api/usuarios/1');

            // Verifica que el estado de la respuesta sea 200 (OK)
            expect(res.statusCode).toEqual(200);
            // Verifica que el cuerpo de la respuesta contenga el mensaje de éxito
            expect(res.body).toEqual({ message: 'Usuario eliminado corectamente' });
            // Verifica que pool.query haya sido llamado una vez
            expect(pool.query).toHaveBeenCalledTimes(1);
            // Verifica que pool.query haya sido llamado con la consulta y el ID correctos
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM usuarios WHERE id_usuario = ?', ['1']);
        });

        test('debería devolver 404 si el usuario a eliminar no es encontrado', async () => {
            // Configura el mock de pool.query para simular que no se afectó ninguna fila (usuario no encontrado)
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            // Realiza una solicitud DELETE a /api/usuarios/999
            const res = await request(app).delete('/api/usuarios/999');

            // Verifica que el estado de la respuesta sea 404 (No encontrado)
            expect(res.statusCode).toEqual(404);
            // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
            expect(res.body).toEqual({ error: 'Usuario no encontrado' });
        });

        test('debería manejar errores al eliminar un usuario', async () => {
            // Simula un error en la base de datos
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            // Realiza una solicitud DELETE a /api/usuarios/1
            const res = await request(app).delete('/api/usuarios/1');

            // Verifica que el estado de la respuesta sea 500 (Error interno del servidor)
            expect(res.statusCode).toEqual(500);
            // Verifica que el cuerpo de la respuesta contenga el mensaje de error esperado
            expect(res.body).toEqual({ error: 'Error al eliminar el usuario' });
        });
    });
});