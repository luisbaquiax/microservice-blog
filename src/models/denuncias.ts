import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario from './usuario';
import Publicacion from './publicaciones';
import Comentario from './comentarios';

// 1️⃣ Definición de los atributos
interface DenunciaAttributes {
  id_denuncia: number;
  id_usuario_denunciante: number;
  id_publicacion?: number | null;
  id_comentario?: number | null;
  motivo: string;
  descripcion?: string | null;
  fecha_denuncia?: Date;
  estado?: 'PENDIENTE' | 'REVISADO' | 'RESUELTO';
}

// 2️⃣ Campos opcionales al crear
type DenunciaCreationAttributes = Optional<
  DenunciaAttributes,
  'id_denuncia' | 'fecha_denuncia' | 'estado' | 'id_publicacion' | 'id_comentario' | 'descripcion'
>;

// 3️⃣ Clase del modelo
class Denuncia extends Model<DenunciaAttributes, DenunciaCreationAttributes>
  implements DenunciaAttributes {
  public id_denuncia!: number;
  public id_usuario_denunciante!: number;
  public id_publicacion?: number | null;
  public id_comentario?: number | null;
  public motivo!: string;
  public descripcion?: string | null;
  public fecha_denuncia?: Date;
  public estado?: 'PENDIENTE' | 'REVISADO' | 'RESUELTO';
}

// 4️⃣ Inicialización
Denuncia.init(
  {
    id_denuncia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario_denunciante: { type: DataTypes.INTEGER, allowNull: false },
    id_publicacion: { type: DataTypes.INTEGER, allowNull: true },
    id_comentario: { type: DataTypes.INTEGER, allowNull: true },
    motivo: { type: DataTypes.STRING(255), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    fecha_denuncia: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'REVISADO', 'RESUELTO'),
      defaultValue: 'PENDIENTE',
    },
  },
  {
    sequelize,
    tableName: 'denuncias',
    timestamps: false,
  }
);

// 5️⃣ Relaciones
Denuncia.belongsTo(Usuario, { foreignKey: 'id_usuario_denunciante', onDelete: 'CASCADE' });
Denuncia.belongsTo(Publicacion, { foreignKey: 'id_publicacion', onDelete: 'CASCADE' });
Denuncia.belongsTo(Comentario, { foreignKey: 'id_comentario', onDelete: 'CASCADE' });

Usuario.hasMany(Denuncia, { foreignKey: 'id_usuario_denunciante', onDelete: 'CASCADE' });

export default Denuncia;
