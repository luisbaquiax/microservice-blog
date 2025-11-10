import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';
import Usuario from './usuario';

// 🔹 Atributos del modelo
export interface SuscripcionAttributes {
  id_usuario_comun: number;
  id_periodista: number;
  fecha_suscripcion?: Date;
}

// 🔹 Campos opcionales al crear una suscripción
export type SuscripcionCreationAttributes = Optional<SuscripcionAttributes, 'fecha_suscripcion'>;

// 🔹 Clase del modelo
export class SuscripcionPeriodista
  extends Model<SuscripcionAttributes, SuscripcionCreationAttributes>
  implements SuscripcionAttributes
{
  public id_usuario_comun!: number;
  public id_periodista!: number;
  public fecha_suscripcion?: Date;
}

// 🔹 Inicialización
SuscripcionPeriodista.init(
  {
    id_usuario_comun: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_periodista: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    fecha_suscripcion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'suscripciones_periodistas',
    timestamps: false,
  }
);

// 🔹 Relaciones
SuscripcionPeriodista.belongsTo(Usuario, {
  foreignKey: 'id_usuario_comun',
  as: 'UsuarioComun',
  onDelete: 'CASCADE',
});

SuscripcionPeriodista.belongsTo(Usuario, {
  foreignKey: 'id_periodista',
  as: 'Periodista',
  onDelete: 'CASCADE',
});

Usuario.hasMany(SuscripcionPeriodista, {
  foreignKey: 'id_usuario_comun',
  as: 'Suscripciones',
  onDelete: 'CASCADE',
});

Usuario.hasMany(SuscripcionPeriodista, {
  foreignKey: 'id_periodista',
  as: 'Seguidores',
  onDelete: 'CASCADE',
});

export default SuscripcionPeriodista;
