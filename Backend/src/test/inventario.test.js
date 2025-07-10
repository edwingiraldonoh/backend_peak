import request from 'supertest';
import express from 'express';
import { pool } from '../db.js'; 
import inventarioRoutes from '../routes/inventario.routes.js';

// Mockea el módulo 'db.js' para controlar el comportamiento de la base de datos
jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(), // Mockea la función query del pool
    },
}));

// Crea una aplicación Express para testear el router
const app = express();
app.use(express.json()); // Necesario para parsear el body de las peticiones
app.use('/inventario', inventarioRoutes); // Monta el router en una ruta base

describe('inventario.routes.js', () => {
    // Limpia los mocks antes de cada test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // // Test para la ruta GET /inventario (obtener todos los inventarios)
    // describe('GET /inventario', () => {
    //     test('Debería obtener todos los inventarios', async () => {
    //         // Datos de ejemplo que el mock de pool.query devolverá
    //         const mockInventarios = [
    //             { id_inventario: 1, cantidad_disponible: 100, unidad_medida: 'unidades', fecha_actualizacion: '2024-01-01', alerta_stock: 10 },
    //             { id_inventario: 2, cantidad_disponible: 50, unidad_medida: 'kg', fecha_actualizacion: '2024-01-02', alerta_stock: 5 },
    //         ];
    //         // Configura el mock para que devuelva los datos esperados
    //         pool.query.mockResolvedValueOnce([mockInventarios]);

    //         // Realiza la petición GET
    //         const res = await request(app).get('/inventario');

    //         // Afirmaciones
    //         expect(res.statusCode).toEqual(200); // Espera un status 200 OK
    //         expect(res.body).toEqual(mockInventarios); // Espera que el cuerpo de la respuesta sea igual a los datos mockeados
    //         expect(pool.query).toHaveBeenCalledTimes(1); // Espera que pool.query haya sido llamado una vez
    //         expect(pool.query).toHaveBeenCalledWith('SELECT * FROM inventario'); // Espera que la consulta sea la correcta
    //     });

    //     test('Debería manejar errores al obtener todos los inventarios', async () => {
    //         // Configura el mock para que rechace la promesa con un error
    //         pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

    //         // Realiza la petición GET
    //         const res = await request(app).get('/inventario');

    //         // Afirmaciones
    //         expect(res.statusCode).toEqual(500); // Espera un status 500 Internal Server Error
    //         expect(res.body).toEqual({ error: 'al obtener los datos del inventario' }); // Espera el mensaje de error específico
    //     });
    // });

    // // Test para la ruta GET /inventario/:id (obtener inventario por ID)
    // describe('GET /inventario/:id', () => {
    //     test('Debería obtener un inventario por ID', async () => {
    //         const mockInventario = { id_inventario: 1, cantidad_disponible: 100, unidad_medida: 'unidades', fecha_actualizacion: '2024-01-01', alerta_stock: 10 };
    //         pool.query.mockResolvedValueOnce([[mockInventario]]); // Nota el doble array para simular rows[0]

    //         const res = await request(app).get('/inventario/1');

    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toEqual(mockInventario);
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         expect(pool.query).toHaveBeenCalledWith('SELECT * FROM inventario WHERE id_inventario = ?', ['1']);
    //     });

    //     test('Debería devolver 404 si el inventario no se encuentra', async () => {
    //         pool.query.mockResolvedValueOnce([[]]); // Simula que no se encontraron filas

    //         const res = await request(app).get('/inventario/999');

    //         expect(res.statusCode).toEqual(404);
    //         expect(res.body).toEqual({ error: 'inventario no encontrada' });
    //     });

    //     test('Debería manejar errores al obtener el inventario por ID', async () => {
    //         pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

    //         const res = await request(app).get('/inventario/1');

    //         expect(res.statusCode).toEqual(500);
    //         expect(res.body).toEqual({ error: 'Error al obtener el inventario' });
    //     });
    // });

    // // Test para la ruta POST /inventario (crear un nuevo inventario)
    // describe('POST /inventario', () => {
    //     test('Debería crear un nuevo inventario', async () => {
    //         const newInventario = { cantidad_disponible: 75, unidad_medida: 'litros', fecha_actualizacion: '2024-07-03', alerta_stock: 8 };
    //         // Simula el resultado de una inserción en la base de datos
    //         pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

    //         const res = await request(app)
    //             .post('/inventario')
    //             .send(newInventario);

    //         expect(res.statusCode).toEqual(201); // Espera un status 201 Created
    //         expect(res.body).toEqual({ id: 3, ...newInventario }); // Espera el ID insertado y los datos del inventario
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         expect(pool.query).toHaveBeenCalledWith(
    //             'INSERT INTO venta (cantidad_disponible, unidad_medida, fecha_actualizacion, alerta_stock) VALUES (?, ?, ?)',
    //             [newInventario.cantidad_disponible, newInventario.unidad_medida, newInventario.fecha_actualizacion, newInventario.alerta_stock]
    //         );
    //     });

    //     test('Debería devolver 400 si faltan campos requeridos', async () => {
    //         const incompleteInventario = { cantidad_disponible: 10 };

    //         const res = await request(app)
    //             .post('/inventario')
    //             .send(incompleteInventario);

    //         expect(res.statusCode).toEqual(400);
    //         expect(res.body).toEqual({ error: 'Datos requeridos obligaroriamente' });
    //         expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
    //     });

    //     test('Debería manejar errores al crear un inventario', async () => {
    //         const newInventario = { cantidad_disponible: 75, unidad_medida: 'litros', fecha_actualizacion: '2024-07-03', alerta_stock: 8 };
    //         pool.query.mockRejectedValueOnce(new Error('Error de inserción'));

    //         const res = await request(app)
    //             .post('/inventario')
    //             .send(newInventario);

    //         expect(res.statusCode).toEqual(500);
    //         expect(res.body).toEqual({ error: 'Error al crear el inventario' });
    //     });
    // });

    // // Test para la ruta PUT /inventario/:id (actualizar un inventario)
    // describe('PUT /inventario/:id', () => {
    //     test('Debería actualizar un inventario existente', async () => {
    //         const updatedInventario = { cantidad_disponible: 120, unidad_medida: 'unidades', fecha_actualizacion: '2024-07-04', alerta_stock: 15 };
    //         // Simula que una fila fue afectada (actualizada)
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    //         const res = await request(app)
    //             .put('/inventario/1')
    //             .send(updatedInventario);

    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toEqual({ message: 'Inventario actualizado correctamente' });
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         expect(pool.query).toHaveBeenCalledWith(
    //             'UPDATE inventario SET cantidad_disponible = ?, unidad_medida = ?, fecha_actualizacion = ?, alerta_stock = ? WHERE id_inventario = ?',
    //             [updatedInventario.cantidad_disponible, updatedInventario.unidad_medida, updatedInventario.fecha_actualizacion, updatedInventario.alerta_stock, '1']
    //         );
    //     });

    //     test('Debería devolver 404 si el inventario a actualizar no se encuentra', async () => {
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

    //         const res = await request(app)
    //             .put('/inventario/999')
    //             .send({ cantidad_disponible: 10, unidad_medida: 'unidades', fecha_actualizacion: '2024-07-04', alerta_stock: 1 });

    //         expect(res.statusCode).toEqual(404);
    //         expect(res.body).toEqual({ error: 'Inventario no encontrado ' });
    //     });

    //     test('Debería manejar errores al actualizar un inventario', async () => {
    //         pool.query.mockRejectedValueOnce(new Error('Error de actualización'));

    //         const res = await request(app)
    //             .put('/inventario/1')
    //             .send({ cantidad_disponible: 10, unidad_medida: 'unidades', fecha_actualizacion: '2024-07-04', alerta_stock: 1 });

    //         expect(res.statusCode).toEqual(500);
    //         expect(res.body).toEqual({ error: 'Error al actualizar el inventario' });
    //     });
    // });

    // // Test para la ruta DELETE /inventario/:id (eliminar un inventario)
    // describe('DELETE /inventario/:id', () => {
    //     test('Debería eliminar un inventario existente', async () => {
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula que una fila fue afectada (eliminada)

    //         const res = await request(app).delete('/inventario/1');

    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toEqual({ message: 'Inventario eliminado corectamente' });
    //         expect(pool.query).toHaveBeenCalledTimes(1);
    //         expect(pool.query).toHaveBeenCalledWith('DELETE FROM inventario WHERE id_inventario = ?', ['1']);
    //     });

    //     test('Debería devolver 404 si el inventario a eliminar no se encuentra', async () => {
    //         pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // Simula que ninguna fila fue afectada

    //         const res = await request(app).delete('/inventario/999');

    //         expect(res.statusCode).toEqual(404);
    //         expect(res.body).toEqual({ error: 'Inventario no encontrado' });
    //     });

    //     test('Debería manejar errores al eliminar un inventario', async () => {
    //         pool.query.mockRejectedValueOnce(new Error('Error de eliminación'));

    //         const res = await request(app).delete('/inventario/1');

    //         expect(res.statusCode).toEqual(500);
    //         expect(res.body).toEqual({ error: 'Error al eliminar el inventario' });
    //     });
    // });
});
