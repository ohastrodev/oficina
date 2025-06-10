//DESENVOLVIDO POR MATHEUS
import { PecaService } from "../services/PecaService.js";

class PecaController {

  static async findAll(req, res, next) {
    PecaService.findAll()
      .then(objs => res.json(objs))
      .catch(next);
  }

  static async findByPk(req, res, next) {
    PecaService.findByPk(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async create(req, res, next) {
    PecaService.create(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async update(req, res, next) {
    PecaService.update(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

  static async delete(req, res, next) {
    PecaService.delete(req)
      .then(obj => res.json(obj))
      .catch(next);
  }

}

export { PecaController };
