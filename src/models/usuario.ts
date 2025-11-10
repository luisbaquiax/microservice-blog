import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Persona from './persona';

// 1️⃣ Definimos los atributos del modelo
interface UsuarioAttributes {
  id_usuario: number;
  nombre_usuario: string;
  password_hash: string;
  tipo_usuario: 'COMUN' | 'PERIODISTA' | 'ADMINISTRADOR';
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  fecha_registro?: Date;
  posicion_politica?: 'IZQUIERDA' | 'CENTRO' | 'DERECHA' | 'NEUTRO';
  medios_comunicacion?: string;
}

// 2️⃣ Campos opcionales al crear un nuevo usuario
type UsuarioCreationAttributes = Optional<UsuarioAttributes, 'id_usuario' | 'estado' | 'fecha_registro'>;

// 3️⃣ Clase del modelo con tipado completo
class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes {
  public id_usuario!: number;
  public nombre_usuario!: string;
  public password_hash!: string;
  public tipo_usuario!: 'COMUN' | 'PERIODISTA' | 'ADMINISTRADOR';
  public estado!: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  public fecha_registro!: Date;
  public posicion_politica!: 'IZQUIERDA' | 'CENTRO' | 'DERECHA' | 'NEUTRO';
  public medios_comunicacion!: string;
}

// 4️⃣ Inicialización del modelo
Usuario.init({
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true },
  nombre_usuario: { type: DataTypes.STRING(255), allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  tipo_usuario: {
    type: DataTypes.ENUM('COMUN', 'PERIODISTA', 'ADMINISTRADOR'),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO'),
    defaultValue: 'ACTIVO'
  },
  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  posicion_politica: {
    type: DataTypes.ENUM('IZQUIERDA', 'CENTRO', 'DERECHA', 'NEUTRO')
  },
  medios_comunicacion: { type: DataTypes.STRING(255) }
}, {
  sequelize,
  tableName: 'usuario',
  timestamps: false
});

// 5️⃣ Relaciones (importante hacerlo después de init)
Usuario.belongsTo(Persona, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Persona.hasOne(Usuario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });

export default Usuario;
