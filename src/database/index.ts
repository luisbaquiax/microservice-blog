import sequelize from './coneccion';

import '../models/persona';
import '../models/usuario';
import '../models/idiomas';
import '../models/publicaciones';
import '../models/publicacion_traducciones';
import '../models/publicacion_fotos';
import '../models/publicacion_archivos';
import '../models/comentarios';
import '../models/likes';
import '../models/suscripciones_periodistas';
import '../models/amigos';
import '../models/notificaciones';
import '../models/historial_lectura';
import '../models/denuncias';
import '../models/token_autenticacion';

// Sincronizar para crear tablas si no existen
sequelize
  .sync({ alter: false })
  .then(() => console.log('✅ Modelos sincronizados con la base de datos.'))
  .catch((err) => console.error('❌ Error al sincronizar modelos:', err));

export default sequelize;
