import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario from './usuario';
import Publicacion from './publicaciones';

// 1️⃣ Atributos del modelo
interface ComentarioAttributes {
  id_comentario: number;
  id_publicacion: number;
  id_usuario: number;
  contenido: string;
  fecha_comentario?: Date;
  estado?: 'VISIBLE' | 'OCULTO' | 'DENUNCIADO';
}

// 2️⃣ Campos opcionales al crear
type ComentarioCreationAttributes = Optional<
  ComentarioAttributes,
  'id_comentario' | 'fecha_comentario' | 'estado'
>;

// 3️⃣ Clase del modelo
class Comentario extends Model<ComentarioAttributes, ComentarioCreationAttributes>
  implements ComentarioAttributes {
  public id_comentario!: number;
  public id_publicacion!: number;
  public id_usuario!: number;
  public contenido!: string;
  public fecha_comentario?: Date;
  public estado?: 'VISIBLE' | 'OCULTO' | 'DENUNCIADO';
}

// 4️⃣ Inicialización
Comentario.init({
  id_comentario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_publicacion: { type: DataTypes.INTEGER, allowNull: false },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  contenido: { type: DataTypes.TEXT, allowNull: false },
  fecha_comentario: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  estado: { type: DataTypes.ENUM('VISIBLE', 'OCULTO', 'DENUNCIADO'), defaultValue: 'VISIBLE' }
}, {
  sequelize,
  tableName: 'comentarios',
  timestamps: false
});

// 5️⃣ Relaciones
Comentario.belongsTo(Publicacion, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });
Comentario.belongsTo(Usuario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Publicacion.hasMany(Comentario, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });
Usuario.hasMany(Comentario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });

export default Comentario;
