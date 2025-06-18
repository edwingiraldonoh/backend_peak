//import { Router } from 'express';
import pkg from 'express'; // Importa el módulo completo como 'pkg'
const { Router } = pkg; // Desestructura 'Router' del objeto 'pkg'
import { pool } from '../db.js';

const router = Router();

//Obtener todas las encuestas de satisfaccion
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM encuesta_satisfaccion');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener las encuestas de satisfaccion' });
    }
});

//Obtener encuestas de satisfaccion por ID
router.get('/:id_encuesta', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM encuesta_satisfaccion WHERE id_encuesta = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Encuesta no encontrada' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener la encuesta' });
    }
});

//Crear una nueva encuesta de satisfaccion
router.post('/', async (req, res) => {
    const {puntuacion, comentarios} = req.body;

    if (!puntuacion || !comentarios) {
        return res.status(400).json({error: 'Puntuacion y comentarios necesarios'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO encuesta_satisfaccion (puntuacion, comentarios) VALUES (?, ?)',
            [puntuacion, comentarios]
        );
        res.status(201).json({ id: result.insertId, puntuacion, comentarios });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la encuesta de satisfaccion' });
    }
});

//Actualizar una encuesta de satisfaccion existente
router.put('/:id_encuesta', async (req, res) => {
    const { puntuacion, comentarios } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE encuesta_satisfaccion SET puntuacion = ?, comentarios = ? WHERE id_encuesta = ?',
            [puntuacion, comentarios, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Encuesta no encontrada '});

        res.json({ message: 'Encuesta de satisfaccion actualizada correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

//Eliminar un encuesta de satisfaccion
router.delete('/:id_encuesta', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM encuesta_satisfaccion WHERE id_encuesta = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Encuesta no encontrada' });

        res.json({ message: 'Encuesta eliminada correctamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la encuesta' });
    }
});


export default router;