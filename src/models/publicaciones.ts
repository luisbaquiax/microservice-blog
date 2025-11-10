import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario  from './usuario';

// 🔹 Atributos del modelo
export interface PublicacionAttributes {
  id_publicacion: number;
  id_usuario: number;
  tipo_publicacion: 'NOTICIA' | 'ARTICULO' | 'FORO';
  titulo: string;
  contenido: string;
  fecha_publicacion?: Date;
  fecha_actualizacion?: Date;
  estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ELIMINADO';
  visibilidad?: 'PUBLICO' | 'AMIGOS';
  orientacion_politica?: 'IZQUIERDA' | 'CENTRO' | 'DERECHA' | 'NEUTRO';
  id_evento_asociado?: number | null;
}

// 🔹 Campos opcionales al crear una publicación
export type PublicacionCreationAttributes = Optional<
  PublicacionAttributes,
  | 'id_publicacion'
  | 'fecha_publicacion'
  | 'fecha_actualizacion'
  | 'estado'
  | 'visibilidad'
  | 'orientacion_politica'
  | 'id_evento_asociado'
>;

// 🔹 Definición del modelo
export class Publicacion
  extends Model<PublicacionAttributes, PublicacionCreationAttributes>
  implements PublicacionAttributes
{
  public id_publicacion!: number;
  public id_usuario!: number;
  public tipo_publicacion!: 'NOTICIA' | 'ARTICULO' | 'FORO';
  public titulo!: string;
  public contenido!: string;
  public fecha_publicacion?: Date;
  public fecha_actualizacion?: Date;
  public estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'ELIMINADO';
  public visibilidad?: 'PUBLICO' | 'AMIGOS';
  public orientacion_politica?: 'IZQUIERDA' | 'CENTRO' | 'DERECHA' | 'NEUTRO';
  public id_evento_asociado?: number | null;
}

// 🔹 Inicialización
Publicacion.init(
  {
    id_publicacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo_publicacion: {
      type: DataTypes.ENUM('NOTICIA', 'ARTICULO', 'FORO'),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    fecha_publicacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'ELIMINADO'),
      defaultValue: 'PENDIENTE',
    },
    visibilidad: {
      type: DataTypes.ENUM('PUBLICO', 'AMIGOS'),
      defaultValue: 'PUBLICO',
    },
    orientacion_politica: {
      type: DataTypes.ENUM('IZQUIERDA', 'CENTRO', 'DERECHA', 'NEUTRO'),
    },
    id_evento_asociado: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'publicaciones',
    timestamps: false,
  }
);

// 🔹 Relaciones
Publicacion.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  onDelete: 'CASCADE',
});

Usuario.hasMany(Publicacion, {
  foreignKey: 'id_usuario',
  onDelete: 'CASCADE',
});

export default Publicacion;
