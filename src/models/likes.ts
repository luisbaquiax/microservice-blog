import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario from './usuario';
import Publicacion from './publicaciones';

// 1️⃣ Definición de los atributos
interface LikeAttributes {
  id_publicacion: number;
  id_usuario: number;
  fecha_like?: Date;
}

// 2️⃣ Campos opcionales al crear
type LikeCreationAttributes = Optional<LikeAttributes, 'fecha_like'>;

// 3️⃣ Clase del modelo
class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public id_publicacion!: number;
  public id_usuario!: number;
  public fecha_like?: Date;
}

// 4️⃣ Inicialización
Like.init(
  {
    id_publicacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    fecha_like: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'likes',
    timestamps: false,
  }
);

// 5️⃣ Relaciones
Like.belongsTo(Publicacion, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });
Like.belongsTo(Usuario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });

Publicacion.hasMany(Like, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });
Usuario.hasMany(Like, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });

export default Like;
