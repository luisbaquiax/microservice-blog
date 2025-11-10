import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario from './usuario';

// 1️⃣ Definición de atributos
interface NotificacionAttributes {
  id_notificacion: number;
  id_usuario: number;
  tipo_notificacion: string;
  mensaje: string;
  url_destino?: string | null;
  fecha_creacion?: Date;
  leida?: boolean;
}

// 2️⃣ Campos opcionales al crear
type NotificacionCreationAttributes = Optional<
  NotificacionAttributes,
  'id_notificacion' | 'url_destino' | 'fecha_creacion' | 'leida'
>;

// 3️⃣ Clase del modelo
class Notificacion
  extends Model<NotificacionAttributes, NotificacionCreationAttributes>
  implements NotificacionAttributes
{
  public id_notificacion!: number;
  public id_usuario!: number;
  public tipo_notificacion!: string;
  public mensaje!: string;
  public url_destino?: string | null;
  public fecha_creacion?: Date;
  public leida?: boolean;
}

// 4️⃣ Inicialización
Notificacion.init(
  {
    id_notificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo_notificacion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url_destino: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notificaciones',
    timestamps: false,
  }
);

// 5️⃣ Relaciones
Notificacion.belongsTo(Usuario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Usuario.hasMany(Notificacion, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });

export default Notificacion;
