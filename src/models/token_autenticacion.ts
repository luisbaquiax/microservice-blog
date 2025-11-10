import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario from './usuario';

// 🔹 Atributos del modelo
export interface TokenAutenticacionAttributes {
  id_token: number;
  id_usuario: number;
  token_hash: string;
  tipo_token: 'VERIFICACION_EMAIL' | 'RESET_PASSWORD' | '2FA' | 'LOGIN';
  fecha_creacion?: Date;
  fecha_expiracion: Date;
  estado?: 'ACTIVO' | 'USADO' | 'EXPIRADO';
  codigo_verificacion?: string | null;
}

// 🔹 Campos opcionales al crear
export type TokenAutenticacionCreationAttributes = Optional<
  TokenAutenticacionAttributes,
  'id_token' | 'fecha_creacion' | 'estado' | 'codigo_verificacion'
>;

// 🔹 Clase del modelo
export class TokenAutenticacion
  extends Model<TokenAutenticacionAttributes, TokenAutenticacionCreationAttributes>
  implements TokenAutenticacionAttributes
{
  public id_token!: number;
  public id_usuario!: number;
  public token_hash!: string;
  public tipo_token!: 'VERIFICACION_EMAIL' | 'RESET_PASSWORD' | '2FA' | 'LOGIN';
  public fecha_creacion?: Date;
  public fecha_expiracion!: Date;
  public estado?: 'ACTIVO' | 'USADO' | 'EXPIRADO';
  public codigo_verificacion?: string | null;
}

// 🔹 Inicialización
TokenAutenticacion.init(
  {
    id_token: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo_token: {
      type: DataTypes.ENUM('VERIFICACION_EMAIL', 'RESET_PASSWORD', '2FA', 'LOGIN'),
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('ACTIVO', 'USADO', 'EXPIRADO'),
      defaultValue: 'ACTIVO',
    },
    codigo_verificacion: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'token_autenticacion',
    timestamps: false,
  }
);

// 🔹 Relaciones
TokenAutenticacion.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  onDelete: 'CASCADE',
});

Usuario.hasMany(TokenAutenticacion, {
  foreignKey: 'id_usuario',
  onDelete: 'CASCADE',
});

export default TokenAutenticacion;
