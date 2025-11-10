import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';

// 1️⃣ Definición de los atributos
interface IdiomaAttributes {
  id_idioma: number;
  codigo_iso: string;
  nombre: string;
}

// 2️⃣ Campos opcionales al crear
type IdiomaCreationAttributes = Optional<IdiomaAttributes, 'id_idioma'>;

// 3️⃣ Clase del modelo
class Idioma extends Model<IdiomaAttributes, IdiomaCreationAttributes> implements IdiomaAttributes {
  public id_idioma!: number;
  public codigo_iso!: string;
  public nombre!: string;
}

// 4️⃣ Inicialización
Idioma.init(
  {
    id_idioma: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo_iso: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'idiomas',
    timestamps: false,
  }
);

export default Idioma;
