import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario from './usuario';

// 1️⃣ Definición de atributos
interface AmigoAttributes {
  id_usuario1: number;
  id_usuario2: number;
  estado?: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  fecha_solicitud?: Date;
  fecha_actualizacion?: Date;
}

// 2️⃣ Campos opcionales al crear
type AmigoCreationAttributes = Optional<
  AmigoAttributes,
  'estado' | 'fecha_solicitud' | 'fecha_actualizacion'
>;

// 3️⃣ Clase del modelo
class Amigo extends Model<AmigoAttributes, AmigoCreationAttributes>
  implements AmigoAttributes {
  public id_usuario1!: number;
  public id_usuario2!: number;
  public estado?: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  public fecha_solicitud?: Date;
  public fecha_actualizacion?: Date;
}

// 4️⃣ Inicialización del modelo
Amigo.init({
  id_usuario1: { type: DataTypes.INTEGER, primaryKey: true },
  id_usuario2: { type: DataTypes.INTEGER, primaryKey: true },
  estado: { type: DataTypes.ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO'), defaultValue: 'PENDIENTE' },
  fecha_solicitud: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fecha_actualizacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  tableName: 'amigos',
  timestamps: false
});

// 5️⃣ Relaciones
Amigo.belongsTo(Usuario, { foreignKey: 'id_usuario1', as: 'Solicitante', onDelete: 'CASCADE' });
Amigo.belongsTo(Usuario, { foreignKey: 'id_usuario2', as: 'Receptor', onDelete: 'CASCADE' });

Usuario.hasMany(Amigo, { foreignKey: 'id_usuario1', as: 'SolicitudesEnviadas' });
Usuario.hasMany(Amigo, { foreignKey: 'id_usuario2', as: 'SolicitudesRecibidas' });

export default Amigo;
