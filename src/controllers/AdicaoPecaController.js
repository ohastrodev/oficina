import { AdicaoPecaService } from '../services/AdicaoPecaService.js';

export const adicionarPeca = async (req, res) => {
    try {
        const resultado = await AdicaoPecaService.adicionarPeca(req);
        res.status(201).json(resultado);
    } catch (error) {
        // Se o erro for relacionado a um serviço não encontrado, retorna 404
        if (error.message.includes('Serviço não encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        // Para outros erros de validação, retorna 400
        res.status(400).json({ error: error.message });
    }
};

export const excluirPeca = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await AdicaoPecaService.excluirPeca(id);
        res.status(200).json(resultado);
    } catch (error) {
        // Se o erro for relacionado a uma peça não encontrada, retorna 404
        if (error.message.includes('Peça não encontrada')) {
            return res.status(404).json({ error: error.message });
        }
        // Para outros erros, retorna 400
        res.status(400).json({ error: error.message });
    }
};

export const relatorioTotalPecas = async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        if (!dataInicio || !dataFim) {
            return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
        }
        const resultado = await AdicaoPecaService.relatorioTotalPecasPorPeriodo(dataInicio, dataFim);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const relatorioPecasMaisUtilizadas = async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        if (!dataInicio || !dataFim) {
            return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
        }
        const resultado = await AdicaoPecaService.relatorioPecasMaisUtilizadas(dataInicio, dataFim);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}; 