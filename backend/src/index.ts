// Punto de arranque del servidor.
import 'dotenv/config'; // carga las variables de backend/.env
import { createApp } from './app';

const PORT = process.env.PORT || 4000;

createApp().listen(PORT, () => {
  console.log(`API del Portal de Clientes escuchando en http://localhost:${PORT}`);
});
