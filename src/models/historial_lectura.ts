import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario from './usuario';
import Publicacion from './publicaciones';

// 1️⃣ Definición de atributos
interface HistorialLecturaAttributes {
  id_historial: number;
  id_usuario: number;
  id_publicacion: number;
  fecha_lectura?: Date;
}

// 2️⃣ Campos opcionales al crear
type HistorialLecturaCreationAttributes = Optional<
  HistorialLecturaAttributes,
  'id_historial' | 'fecha_lectura'
>;

// 3️⃣ Clase del modelo
class HistorialLectura
  extends Model<HistorialLecturaAttributes, HistorialLecturaCreationAttributes>
  implements HistorialLecturaAttributes
{
  public id_historial!: number;
  public id_usuario!: number;
  public id_publicacion!: number;
  public fecha_lectura?: Date;
}

// 4️⃣ Inicialización del modelo
HistorialLectura.init(
  {
    id_historial: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuario', key: 'id_usuario' },
    },
    id_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'publicaciones', key: 'id_publicacion' },
    },
    fecha_lectura: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'historial_lectura',
    timestamps: false,
  }
);

// 5️⃣ Relaciones correctas
HistorialLectura.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  onDelete: 'CASCADE',
});

HistorialLectura.belongsTo(Publicacion, {
  foreignKey: 'id_publicacion',
  onDelete: 'CASCADE',
});

Usuario.hasMany(HistorialLectura, {
  foreignKey: 'id_usuario',
  onDelete: 'CASCADE',
});

Publicacion.hasMany(HistorialLectura, {
  foreignKey: 'id_publicacion',
  onDelete: 'CASCADE',
});

export default HistorialLectura;
