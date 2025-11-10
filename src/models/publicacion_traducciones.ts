import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Idioma from './idiomas';
import Publicacion from './publicaciones';

// 🔹 Definimos los atributos del modelo
export interface PublicacionTraduccionAttributes {
  id_traduccion: number;
  id_publicacion: number;
  id_idioma: number;
  titulo_traducido?: string;
  contenido_traducido?: string;
  fecha_traduccion?: Date;
}

// 🔹 Atributos opcionales al crear
export type PublicacionTraduccionCreationAttributes = Optional<
  PublicacionTraduccionAttributes,
  'id_traduccion' | 'fecha_traduccion'
>;

// 🔹 Clase tipada
export class PublicacionTraduccion
  extends Model<PublicacionTraduccionAttributes, PublicacionTraduccionCreationAttributes>
  implements PublicacionTraduccionAttributes
{
  public id_traduccion!: number;
  public id_publicacion!: number;
  public id_idioma!: number;
  public titulo_traducido?: string;
  public contenido_traducido?: string;
  public fecha_traduccion?: Date;
}

// 🔹 Inicialización del modelo
PublicacionTraduccion.init(
  {
    id_traduccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_idioma: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo_traducido: {
      type: DataTypes.STRING(255),
    },
    contenido_traducido: {
      type: DataTypes.TEXT('long'),
    },
    fecha_traduccion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'publicacion_traducciones',
    timestamps: false,
  }
);

// 🔹 Relaciones
PublicacionTraduccion.belongsTo(Publicacion, {
  foreignKey: 'id_publicacion',
  onDelete: 'CASCADE',
});

Publicacion.hasMany(PublicacionTraduccion, {
  foreignKey: 'id_publicacion',
  onDelete: 'CASCADE',
});

PublicacionTraduccion.belongsTo(Idioma, {
  foreignKey: 'id_idioma',
});

Idioma.hasMany(PublicacionTraduccion, {
  foreignKey: 'id_idioma',
});

export default PublicacionTraduccion;
