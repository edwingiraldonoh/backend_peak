import request from 'supertest';
import express from 'express';
import { pool } from '../db.js'; 
import usuariosRoutes from '../routes/usuarios.routes.js';

// Mockea el módulo 'db.js' para controlar el comportamiento de la base de datos
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(), // Mockea la función query del pool
    },
}));

// Crea una aplicación Express para testear el router
const app = express();
app.use(express.json()); // Necesario para parsear el body de las peticiones
app.use('/usuarios', usuariosRoutes); // Monta el router en una ruta base

describe('usuarios.routes.js', () => {
    // Limpia los mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test para la ruta GET /usuarios (obtener todos los usuarios)
    describe('GET /usuarios', () => {
        test('Debería obtener todos los usuarios', async () => {
            // Datos de ejemplo que el mock de pool.query devolverá
            const mockUsuarios = [
                { id_usuario: 1, nombre_usuario: 'Juan', apellido_usuario: 'Perez', contraseña: 'hashedpass1', correo_electronico: 'juan@example.com', telefono: '123456789', fecha_creacion: '2023-01-01', fecha_modificacion: '2023-01-01' },
                { id_usuario: 2, nombre_usuario: 'Maria', apellido_usuario: 'Gomez', contraseña: 'hashedpass2', correo_electronico: 'maria@example.com', telefono: '987654321', fecha_creacion: '2023-02-01', fecha_modificacion: '2023-02-01' },
            ];
            // Configura el mock para que devuelva los datos esperados
            pool.query.mockResolvedValueOnce([mockUsuarios]);

            // Realiza la petición GET
            const res = await request(app).get('/usuarios');

            // Afirmaciones
            expect(res.statusCode).toEqual(200); // Espera un status 200 OK
            expect(res.body).toEqual(mockUsuarios); // Espera que el cuerpo de la respuesta sea igual a los datos mockeados
            expect(pool.query).toHaveBeenCalledTimes(1); // Espera que pool.query haya sido llamado una vez
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM usuarios'); // Espera que la consulta sea la correcta
        });

        test('Debería manejar errores al obtener todos los usuarios', async () => {
            // Configura el mock para que rechace la promesa con un error
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            // Realiza la petición GET
            const res = await request(app).get('/usuarios');

            // Afirmaciones
            expect(res.statusCode).toEqual(500); // Espera un status 500 Internal Server Error
            expect(res.body).toEqual({ error: 'al obtener los datos del usuario' }); // Espera el mensaje de error específico
        });
    });

    // Test para la ruta GET /usuarios/:id (obtener usuario por ID)
    describe('GET /usuarios/:id', () => {
        test('Debería obtener un usuario por ID', async () => {
            const mockUsuario = { id_usuario: 1, nombre_usuario: 'Juan', apellido_usuario: 'Perez', contraseña: 'hashedpass1', correo_electronico: 'juan@example.com', telefono: '123456789', fecha_creacion: '2023-01-01', fecha_modificacion: '2023-01-01' };
            pool.query.mockResolvedValueOnce([[mockUsuario]]); // Nota el doble array para simular rows[0]

            const res = await request(app).get('/usuarios/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockUsuario);
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM usuarios WHERE id_usuario = ?', ['1']);
        });

        test('Debería devolver 404 si el usuario no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([[]]); // Simula que no se encontraron filas

            const res = await request(app).get('/usuarios/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Usuario no encontrado' });
        });

        test('Debería manejar errores al obtener el usuario por ID', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

            const res = await request(app).get('/usuarios/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al obtener el usuario' });
        });
    });

    // Test para la ruta POST /usuarios (crear un nuevo usuario)
    describe('POST /usuarios', () => {
        test('Debería crear un nuevo usuario', async () => {
            const newUsuario = { nombre_usuario: 'Carlos', apellido_usuario: 'Ruiz', contraseña: 'newpass', correo_electronico: 'carlos@example.com', telefono: '555111222', fecha_creacion: '2024-07-03', fecha_modificacion: '2024-07-03' };
            // Simula el resultado de una inserción en la base de datos
            pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

            const res = await request(app)
                .post('/usuarios')
                .send(newUsuario);

            expect(res.statusCode).toEqual(201); // Espera un status 201 Created
            expect(res.body).toEqual({ id: 3, ...newUsuario }); // Espera el ID insertado y los datos del usuario
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO usuarios (nombre_usuario, apellido_usuario, estado, rol, contraseña, correo_electronico, telefono, fecha_creacion, fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [newUsuario.nombre_usuario, newUsuario.apellido_usuario, newUsuario.contraseña, newUsuario.correo_electronico, newUsuario.telefono, newUsuario.fecha_creacion, newUsuario.fecha_modificacion] // Asegúrate de que los parámetros coincidan con tu query
            );
        });

        test('Debería devolver 400 si faltan campos requeridos', async () => {
            const incompleteUsuario = { nombre_usuario: 'Ana', apellido_usuario: 'Diaz' }; 

            const res = await request(app)
                .post('/usuarios')
                .send(incompleteUsuario);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ error: 'Datos requeridos obligatoriamente' });
            expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
        });

        test('Debería manejar errores al crear un usuario', async () => {
            const newUsuario = { nombre_usuario: 'Error', apellido_usuario: 'Test', contraseña: 'errpass', correo_electronico: 'error@example.com', telefono: '000', fecha_creacion: '2024-07-03', fecha_modificacion: '2024-07-03' };
            pool.query.mockRejectedValueOnce(new Error('Error de inserción'));

            const res = await request(app)
                .post('/usuarios')
                .send(newUsuario);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al crear el usuario' });
        });
    });

    // Test para la ruta PUT /usuarios/:id (actualizar un usuario)
    describe('PUT /usuarios/:id', () => {
        test('Debería actualizar un usuario existente', async () => {
            const updatedUsuario = { nombre_usuario: 'Juan Updated', apellido_usuario: 'Perez Updated', contraseña: 'newhashedpass', correo_electronico: 'juan_updated@example.com', telefono: '111222333', fecha_creacion: '2023-01-01', fecha_modificacion: '2024-07-04' };
            // Simula que una fila fue afectada (actualizada)
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const res = await request(app)
                .put('/usuarios/1')
                .send(updatedUsuario);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Usuario actualizado correctamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE usuarios SET nombre_usuario = ?, apellido_usuario = ?, contraseña = ?, correo_electonico = ?, telefono = ?, fecha_creacion = ?, fecha_modificacion = ? WHERE id_usuario = ?',
                [updatedUsuario.nombre_usuario, updatedUsuario.apellido_usuario, updatedUsuario.contraseña, updatedUsuario.correo_electronico, updatedUsuario.telefono, updatedUsuario.fecha_creacion, updatedUsuario.fecha_modificacion, '1']
            );
        });

        test('Debería devolver 404 si el usuario a actualizar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app)
                .put('/usuarios/999')
                .send({ nombre_usuario: 'Inexistente', apellido_usuario: 'User', contraseña: 'pass', correo_electronico: 'inexistente@example.com', telefono: '0', fecha_creacion: '2023-01-01', fecha_modificacion: '2023-01-01' });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Usuario no encontrado ' });
        });

        test('Debería manejar errores al actualizar un usuario', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de actualización'));

            const res = await request(app)
                .put('/usuarios/1')
                .send({ nombre_usuario: 'Error', apellido_usuario: 'User', contraseña: 'pass', correo_electronico: 'error@example.com', telefono: '0', fecha_creacion: '2023-01-01', fecha_modificacion: '2023-01-01' });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al actualizar el usuario' });
        });
    });

    // Test para la ruta DELETE /usuarios/:id (eliminar un usuario)
    describe('DELETE /usuarios/:id', () => {
        test('Debería eliminar un usuario existente', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula que una fila fue afectada (eliminada)

            const res = await request(app).delete('/usuarios/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Usuario eliminado corectamente' });
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith('DELETE FROM usuarios WHERE id_usuario = ?', ['1']);
        });

        test('Debería devolver 404 si el usuario a eliminar no se encuentra', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

            const res = await request(app).delete('/usuarios/999');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Usuario no encontrado' });
        });

        test('Debería manejar errores al eliminar un usuario', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de eliminación'));

            const res = await request(app).delete('/usuarios/1');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error al eliminar el usuario' });
        });
    });
});
