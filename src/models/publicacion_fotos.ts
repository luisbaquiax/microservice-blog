import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import { Publicacion } from './publicaciones';

// Definimos los atributos del modelo
export interface PublicacionFotoAttributes {
  id_foto: number;
  id_publicacion: number;
  url_foto: string;
  descripcion?: string;
  fecha_subida?: Date;
}

// Atributos opcionales al crear una nueva instancia
export type PublicacionFotoCreationAttributes = Optional<
  PublicacionFotoAttributes,
  'id_foto' | 'fecha_subida'
>;

// Creamos la clase con tipado
export class PublicacionFoto
  extends Model<PublicacionFotoAttributes, PublicacionFotoCreationAttributes>
  implements PublicacionFotoAttributes
{
  public id_foto!: number;
  public id_publicacion!: number;
  public url_foto!: string;
  public descripcion?: string;
  public fecha_subida?: Date;
}

// Definimos el modelo en Sequelize
PublicacionFoto.init(
  {
    id_foto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url_foto: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
    },
    fecha_subida: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'publicacion_fotos',
    timestamps: false,
  }
);

// Relaciones
PublicacionFoto.belongsTo(Publicacion, {
  foreignKey: 'id_publicacion',
  onDelete: 'CASCADE',
});

Publicacion.hasMany(PublicacionFoto, {
  foreignKey: 'id_publicacion',
  onDelete: 'CASCADE',
});

export default PublicacionFoto;
