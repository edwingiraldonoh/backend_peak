import request from 'supertest';
import express from 'express'; 
import { jest } from '@jest/globals'; 

jest.mock('../db.js', () => ({ 
  pool: {
    query: jest.fn(), // Mockea la función query del pool
  },
}));


import facturacionRoutes from '../routes/facturacion.routes.js'; 

// Crea una instancia de Express para Supertest
const app = express();
app.use(express.json()); // Necesario para parsear el body en peticiones POST/PUT
app.use('/api/facturas', facturacionRoutes); // Monta las rutas en un prefijo

import { pool } from '../db.js'; 

describe('Rutas de Facturación', () => {

  // Limpia el mock de pool.query antes de cada test
  beforeEach(() => {
    pool.query.mockClear();
  });

  // Test para GET /api/facturas (obtener todas las facturas)
  describe('GET /api/facturas', () => {
    it('debería devolver todas las facturas', async () => {
      const mockFacturas = [
        { id_factura: 1, fecha_factura: '2023-01-01', metodo_pago: 'Tarjeta', descuentos: 10, impuesto: 5, tipo_facturacion: 'Venta' },
        { id_factura: 2, fecha_factura: '2023-01-02', metodo_pago: 'Efectivo', descuentos: 0, impuesto: 5, tipo_facturacion: 'Servicio' },
      ];
      // Configura el mock para que devuelva un resultado exitoso
      pool.query.mockResolvedValueOnce([mockFacturas]);

      const res = await request(app).get('/api/facturas');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFacturas);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM facturacion');
    });

    it('debería manejar errores al obtener todas las facturas', async () => {
      // Configura el mock para que lance un error
      pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const res = await request(app).get('/api/facturas');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'al obtener la factura' });
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM facturacion');
    });
  });

  // Test para GET /api/facturas/:id (obtener factura por ID)
  describe('GET /api/facturas/:id', () => {
    it('debería devolver una factura por ID', async () => {
      const mockFactura = { id_factura: 1, fecha_factura: '2023-01-01', metodo_pago: 'Tarjeta', descuentos: 10, impuesto: 5, tipo_facturacion: 'Venta' };
      pool.query.mockResolvedValueOnce([[mockFactura]]); // Array anidado porque pool.query devuelve [rows, fields]

      const res = await request(app).get('/api/facturas/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockFactura);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM facturacion WHERE id_factura= ?', ['1']);
    });

    it('debería devolver 404 si la factura no se encuentra', async () => {
      pool.query.mockResolvedValueOnce([[]]); // No se encontraron filas

      const res = await request(app).get('/api/facturas/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Factura no encontrada' });
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM facturacion WHERE id_factura= ?', ['999']);
    });

    it('debería manejar errores al obtener una factura por ID', async () => {
      pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const res = await request(app).get('/api/facturas/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Error al obtener la facturacion' });
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM facturacion WHERE id_factura= ?', ['1']);
    });
  });

  // Test para POST /api/facturas (crear nueva factura)
  describe('POST /api/facturas', () => {
    it('debería crear una nueva factura', async () => {
      const newFactura = { fecha_factura: '2023-07-01', metodo_pago: 'Transferencia', descuentos: 15, impuesto: 10, tipo_facturacion: 'Servicio' };
      // Simula el resultado de una inserción exitosa
      pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

      const res = await request(app)
        .post('/api/facturas')
        .send(newFactura);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ id: 3, ...newFactura });
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO factura (fecha_factura, metodo_pago, descuentos, impuesto, tipo_facturacion) VALUES (?, ?, ?, ?, ?)',
        [newFactura.fecha_factura, newFactura.metodo_pago, newFactura.descuentos, newFactura.impuesto, newFactura.tipo_facturacion]
      );
    });

    it('debería devolver 400 si faltan campos requeridos', async () => {
      const invalidFactura = { fecha_factura: '2023-07-01', metodo_pago: 'Transferencia' };

      const res = await request(app)
        .post('/api/facturas')
        .send(invalidFactura);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Metodo de pago y tipo de facturacion son requeridos' });
      expect(pool.query).not.toHaveBeenCalled(); // No debería llamar a la base de datos
    });

    it('debería manejar errores al crear una factura', async () => {
      const newFactura = { fecha_factura: '2023-07-01', metodo_pago: 'Transferencia', descuentos: 15, impuesto: 10, tipo_facturacion: 'Servicio' };
      pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const res = await request(app)
        .post('/api/facturas')
        .send(newFactura);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Error al crear la factura' });
      expect(pool.query).toHaveBeenCalled();
    });
  });

  // Test para PUT /api/facturas/:id (actualizar factura)
  describe('PUT /api/facturas/:id', () => {
    it('debería actualizar una factura existente', async () => {
      const updatedFactura = { fecha_factura: '2023-07-02', metodo_pago: 'Crédito', descuentos: 20, impuesto: 12, tipo_facturacion: 'Venta' };
      // Simula el resultado de una actualización exitosa (affectedRows > 0)
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); 

      const res = await request(app)
        .put('/api/facturas/1')
        .send(updatedFactura);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ message: 'Factura actualizada correctamente' });
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE facturacion SET fecha_facturacion = ?, metodo_pago = ?, descuentos = ?, impuesto = ?, tipo_facturacion = ? WHERE id_factura = ?',
        [updatedFactura.fecha_factura, updatedFactura.metodo_pago, updatedFactura.descuentos, updatedFactura.impuesto, updatedFactura.tipo_facturacion, '1']
      );
    });

    it('debería devolver 404 si la factura a actualizar no se encuentra', async () => {
      const updatedFactura = { fecha_factura: '2023-07-02', metodo_pago: 'Crédito', descuentos: 20, impuesto: 12, tipo_facturacion: 'Venta' };
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .put('/api/facturas/999')
        .send(updatedFactura);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Factura no encontrada ' });
      expect(pool.query).toHaveBeenCalled();
    });

    it('debería manejar errores al actualizar una factura', async () => {
      const updatedFactura = { fecha_factura: '2023-07-02', metodo_pago: 'Crédito', descuentos: 20, impuesto: 12, tipo_facturacion: 'Venta' };
      pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const res = await request(app)
        .put('/api/facturas/1')
        .send(updatedFactura);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Error al actualizar la factura' });
      expect(pool.query).toHaveBeenCalled();
    });
  });

  // Test para DELETE /api/facturas/:id (eliminar factura)
  describe('DELETE /api/facturas/:id', () => {
    it('debería eliminar una factura existente', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula eliminación exitosa

      const res = await request(app).delete('/api/facturas/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ message: 'Factura eliminada corectamente' });
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM facturacion WHERE id_factura = ?', ['1']);
    });

    it('debería devolver 404 si la factura a eliminar no se encuentra', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // No se afectaron filas

      const res = await request(app).delete('/api/facturas/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Factura no encontrada' });
      expect(pool.query).toHaveBeenCalled();
    });

    it('debería manejar errores al eliminar una factura', async () => {
      pool.query.mockRejectedValueOnce(new Error('Error de base de datos'));

      const res = await request(app).delete('/api/facturas/1');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Error al eliminar la factura' });
      expect(pool.query).toHaveBeenCalled();
    });
  });
});