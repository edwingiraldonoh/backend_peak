//import { Router } from 'express';
import pkg from 'express'; // Importa el módulo completo como 'pkg'
const { Router } = pkg; // Desestructura 'Router' del objeto 'pkg'
import { pool } from '../db.js';

const router = Router();

//Obtener todos los informes de inventarios
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM informe_inventario');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'al obtener las encuestas de satisfaccion' });
    }
});

//Obtener el informe de inventario por ID
router.get('/:id_informe', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM informe_inventario WHERE id_informe = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Informe no encontrado' });
    res.json(rows[0]);
    }catch (error) {
        res.status(500).json({ error: 'Error al obtener el informe' });
    }
});

//Crear un nuevo informe de inventario
router.post('/', async (req, res) => {
    const {descripcion_informe} = req.body;

    if (!descripcion_informe) {
        return res.status(400).json({error: 'La descripcion es necesaria'});
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO informe_inventario (descripcion_informe) VALUES (?)',
            [descripcion_informe]
        );
        res.status(201).json({ id: result.insertId, descripcion_informe });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la descripcion del informe' });
    }
});

//Actualizar el informe de inventario existente
router.put('/:id_informe', async (req, res) => {
    const { descripcion_informe } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE informe_inventario SET descripcion_informe = ? WHERE id_informe = ?',
            [puntuacion, comentarios, req.params.id]
        );

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Informe no encontrado '});

        res.json({ message: 'Informe de inventario actualizado correctamente'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el informe de inventario' });
    }
});

//Eliminar el informe de inventario
router.delete('/:id_informe', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM informe_inventario WHERE id_informe = ?', [req.params.id]);

        if (result.affectdRows === 0) return res.status(404).json({ error: 'Informe no encontrado' });

        res.json({ message: 'Informe eliminado correctamente'})
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el informe' });
    }
});


export default router;