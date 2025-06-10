import { Model, DataTypes } from 'sequelize';

class Peca extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "Nome da peça deve ser preenchido!" },
          len: { args: [2, 50], msg: "O nome da peça deve ter entre 2 e 50 caracteres!" }
        }
      },
      codigo: {
        type: DataTypes.INTEGER,
        unique: true,
        validate: {
          isInt: { msg: "O código da peça deve ser um número inteiro!" }
        }
      },
      preco: {
        type: DataTypes.FLOAT,
        validate: {
          isFloat: { msg: "O preço da peça deve ser um valor decimal!" }
        }
      },
      estoque: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: { msg: "O estoque da peça deve ser um número inteiro!" }
        }
      }
    }, { sequelize, modelName: 'peca', tableName: 'pecas' })
  }

  static associate(models) {
    // this.belongsTo(models.adicaoPeca, {
    //   foreignKey: 'pecaId',
    //   as: 'adicoes'
    // });
  }
}

export { Peca };
