import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/coneccion';

// 1️⃣ Definición de atributos
interface PersonaAttributes {
  id_persona: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  dpi: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  codigo_postal?: string;
  fecha_registro?: Date;
  sexo?: 'M' | 'F' | 'OTRO';
  tipo_sangre?: string;
  biografia?: string;
}

// 2️⃣ Atributos opcionales al crear
type PersonaCreationAttributes = Optional<
  PersonaAttributes,
  | 'id_persona'
  | 'telefono'
  | 'direccion'
  | 'ciudad'
  | 'pais'
  | 'codigo_postal'
  | 'fecha_registro'
  | 'sexo'
  | 'tipo_sangre'
  | 'biografia'
>;

// 3️⃣ Clase del modelo
class Persona extends Model<PersonaAttributes, PersonaCreationAttributes>
  implements PersonaAttributes {
  public id_persona!: number;
  public nombre!: string;
  public apellido!: string;
  public fecha_nacimiento!: Date;
  public dpi!: string;
  public correo!: string;
  public telefono?: string;
  public direccion?: string;
  public ciudad?: string;
  public pais?: string;
  public codigo_postal?: string;
  public fecha_registro?: Date;
  public sexo?: 'M' | 'F' | 'OTRO';
  public tipo_sangre?: string;
  public biografia?: string;
}

// 4️⃣ Inicialización del modelo
Persona.init({
  id_persona: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  fecha_nacimiento: { type: DataTypes.DATE, allowNull: false },
  dpi: { type: DataTypes.STRING(13), allowNull: false, unique: true },
  correo: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  telefono: { type: DataTypes.STRING(8) },
  direccion: { type: DataTypes.TEXT },
  ciudad: { type: DataTypes.STRING(100) },
  pais: { type: DataTypes.STRING(100), defaultValue: 'Guatemala' },
  codigo_postal: { type: DataTypes.STRING(10) },
  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  sexo: { type: DataTypes.ENUM('M', 'F', 'OTRO') },
  tipo_sangre: { type: DataTypes.STRING(50) },
  biografia: { type: DataTypes.TEXT }
}, {
  sequelize,
  tableName: 'persona',
  timestamps: false
});

export default Persona;
