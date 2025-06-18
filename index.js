import express from 'express';
import morgan from 'morgan';
import productosRoutes from './src/routes/productos.routes.js';
import ventaRoutes from './src/routes/venta.routes.js'
import encuestaRoutes from './src/routes/encuesta_satisfaccion.routes.js'
import facturaRoutes from './src/routes/facturacion.routes.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());

app.get('/',(req, res) => {
    res.send('El servidor esta funcionando correctamente');
});

app.use('/api/productos', productosRoutes);
app.use('/api/venta', ventaRoutes)
app.use('api/encuesta_satisfaccion', encuestaRoutes)
app.use('api/facturacion', facturaRoutes)

app.listen(PORT, () => {
    console.log('Servidor ejecutandose en http://localhost:3000')
});
