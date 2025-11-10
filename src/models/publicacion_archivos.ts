import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Publicacion from './publicaciones';

// 1️⃣ Definición de los atributos
interface PublicacionArchivoAttributes {
  id_archivo: number;
  id_publicacion: number;
  url_archivo: string;
  tipo?: string | null;
  fecha_subida?: Date;
}

// 2️⃣ Campos opcionales al crear
type PublicacionArchivoCreationAttributes = Optional<
  PublicacionArchivoAttributes,
  'id_archivo' | 'tipo' | 'fecha_subida'
>;

// 3️⃣ Clase del modelo
class PublicacionArchivo
  extends Model<PublicacionArchivoAttributes, PublicacionArchivoCreationAttributes>
  implements PublicacionArchivoAttributes
{
  public id_archivo!: number;
  public id_publicacion!: number;
  public url_archivo!: string;
  public tipo?: string | null;
  public fecha_subida?: Date;
}

// 4️⃣ Inicialización
PublicacionArchivo.init(
  {
    id_archivo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    fecha_subida: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'publicacion_archivos',
    timestamps: false,
  }
);

// 5️⃣ Relaciones
PublicacionArchivo.belongsTo(Publicacion, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });
Publicacion.hasMany(PublicacionArchivo, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });

export default PublicacionArchivo;
