import { Model, DataTypes } from 'sequelize';

class AdicaoPeca extends Model {
  static init(sequelize) {
    super.init({
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true
      },
      quantidade: { 
        type: DataTypes.INTEGER,
        validate: {
          isInt: { msg: "A quantidade deve ser um número inteiro!" }
        }
      },
      valor: { 
        type: DataTypes.FLOAT,
        validate: {
          isFloat: { msg: "O valor deve ser um número decimal!" }
        }
      },
      data: { 
        type: DataTypes.DATEONLY,
        validate: {
          isDate: { msg: "A data deve ser preenchida no formato AAAA-MM-DD!" }
        }
      },
      peca_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'pecas', key: 'id' }
      }
    }, { sequelize, modelName: 'AdicaoPeca', tableName: 'adicao_pecas' })
  }

  static associate(models) {
    this.belongsTo(models.AberturaServico, {
      foreignKey: 'abertura_servico_id',
      as: 'ordemServico'
    });
    this.belongsTo(models.Peca, {
      foreignKey: 'peca_id',
      as: 'peca'
    });
  }
}

export { AdicaoPeca };
