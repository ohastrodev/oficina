const API_URL = 'https://oficina-ifes-backend.onrender.com';

// --- RELATÓRIOS ---
let relatorioAbaAtiva = 'os-periodo';
let graficoRelatorio = null;

function mostrarSecao(secao) {
    document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');
    document.getElementById(secao).style.display = '';
    if (secao === 'funcionarios') carregarFuncionarios();
    if (secao === 'veiculos') carregarVeiculos();
    if (secao === 'pecas') carregarPecas();
    if (secao === 'servicos') carregarServicos();
    if (secao === 'relatorios') {
        selecionarAbaRelatorio(relatorioAbaAtiva);
    }
}

function selecionarAbaRelatorio(aba) {
    relatorioAbaAtiva = aba;
    document.querySelectorAll('.aba-relatorio').forEach(btn => btn.classList.remove('aba-ativa'));
    document.getElementById('aba-' + aba).classList.add('aba-ativa');
    document.getElementById('conteudo-relatorio').innerHTML = '';
    esconderGraficoRelatorio();
}

function buscarRelatorioAtivo() {
    esconderGraficoRelatorio();
    const dataInicio = document.getElementById('data-inicio-relatorio').value;
    const dataFim = document.getElementById('data-fim-relatorio').value;
    if(!dataInicio || !dataFim) {
        alert('Selecione o período!');
        return;
    }
    switch(relatorioAbaAtiva) {
        case 'os-periodo':
            buscarRelatorioOSPorPeriodo(dataInicio, dataFim); break;
        case 'desempenho-funcionarios':
            buscarRelatorioDesempenhoFuncionarios(dataInicio, dataFim); break;
        case 'total-pecas':
            buscarRelatorioTotalPecas(dataInicio, dataFim); break;
        case 'pecas-mais-utilizadas':
            buscarRelatorioPecasMaisUtilizadas(dataInicio, dataFim); break;
        case 'os-funcionario':
            buscarRelatorioOSPorFuncionario(dataInicio, dataFim); break;
        case 'servicos-mais-prestados':
            buscarRelatorioServicosMaisPrestados(dataInicio, dataFim); break;
    }
}

async function buscarRelatorioOSPorPeriodo(dataInicio, dataFim) {
    const resp = await fetch(`${API_URL}/ExecucaoServico/relatorios/ordens?dataInicio=${dataInicio}&dataFim=${dataFim}`);
    const dados = await resp.json();
    if(Array.isArray(dados)) renderTabelaOSPorPeriodo(dados);
    else alert(dados.error || 'Erro ao buscar relatório!');
}
function mostrarValor(val) {
    return (val === null || val === undefined || val === '' || val === 'null') ? '-' : val;
}
function renderTabelaOSPorPeriodo(lista) {
    if (lista && lista.length > 0) {
        mostrarGraficoRelatorio(
            'bar',
            lista.map(item => item.servico.descricao),
            lista.map(item => Number(item.valores.total)),
            'Valor Total por Serviço'
        );
    } else {
        esconderGraficoRelatorio();
    }
    let html = `<table><thead><tr><th>Nº OS</th><th>Status</th><th>Abertura</th><th>Finalização</th><th>Cliente</th><th>Cidade</th><th>Placa</th><th>Modelo</th><th>Serviço</th><th>Mão de Obra</th><th>Total</th><th>Com Desconto</th><th>Pagamento</th><th>Responsável</th><th>Cargo</th></tr></thead><tbody>`;
    for(const item of lista) {
        html += `<tr><td>${mostrarValor(item.ordem_servico.numero)}</td><td>${mostrarValor(item.ordem_servico.status)}</td><td>${mostrarValor(item.datas.abertura)}</td><td>${mostrarValor(item.datas.finalizacao)}</td><td>${mostrarValor(item.cliente.nome)}</td><td>${mostrarValor(item.cliente.cidade)}</td><td>${mostrarValor(item.veiculo.placa)}</td><td>${mostrarValor(item.veiculo.modelo)}</td><td>${mostrarValor(item.servico.descricao)}</td><td>${mostrarValor(item.servico.valor_mao_obra)}</td><td>${mostrarValor(item.valores.total)}</td><td>${mostrarValor(item.valores.com_desconto)}</td><td>${mostrarValor(item.valores.forma_pagamento)}</td><td>${mostrarValor(item.responsavel.nome)}</td><td>${mostrarValor(item.responsavel.cargo)}</td></tr>`;
    }
    html += '</tbody></table>';
    document.getElementById('conteudo-relatorio').innerHTML = html;
}

async function buscarRelatorioDesempenhoFuncionarios(dataInicio, dataFim) {
    const resp = await fetch(`${API_URL}/ExecucaoServico/relatorios/desempenho?dataInicio=${dataInicio}&dataFim=${dataFim}`);
    const dados = await resp.json();
    if(Array.isArray(dados)) renderTabelaDesempenhoFuncionarios(dados);
    else alert(dados.error || 'Erro ao buscar relatório!');
}
function renderTabelaDesempenhoFuncionarios(lista) {
    if (lista && lista.length > 0) {
        mostrarGraficoRelatorio(
            'bar',
            lista.map(item => item.funcionario?.nome),
            lista.map(item => Number(item.indicadores?.eficiencia?.replace('%',''))),
            'Eficiência (%)'
        );
    } else {
        esconderGraficoRelatorio();
    }
    let html = `<table><thead><tr><th>Funcionário</th><th>Cargo</th><th>Qtd Serviços</th><th>Valor Total</th><th>Eficiência</th><th>Tempo Médio (dias)</th><th>Taxa Conclusão</th></tr></thead><tbody>`;
    for(const item of lista) {
        html += `<tr><td>${mostrarValor(item.funcionario?.nome)}</td><td>${mostrarValor(item.funcionario?.cargo)}</td><td>${mostrarValor(item.indicadores?.total_servicos)}</td><td>${mostrarValor(item.indicadores?.valor_total_servicos)}</td><td>${mostrarValor(item.indicadores?.eficiencia)}</td><td>${mostrarValor(item.indicadores?.tempo_medio_dias)}</td><td>${mostrarValor(item.indicadores?.taxa_conclusao)}</td></tr>`;
    }
    html += '</tbody></table>';
    document.getElementById('conteudo-relatorio').innerHTML = html;
}

async function buscarRelatorioTotalPecas(dataInicio, dataFim) {
    const resp = await fetch(`${API_URL}/relatorios/pecas/total?dataInicio=${dataInicio}&dataFim=${dataFim}`);
    const dados = await resp.json();
    if (dados && typeof dados === 'object' && !Array.isArray(dados) && dados.quantidadeTotal !== undefined) {
        renderTabelaTotalPecas(dados);
    } else {
        alert(dados.error || 'Erro ao buscar relatório!');
    }
}
function renderTabelaTotalPecas(dados) {
    if (dados && dados.quantidadeTotal !== undefined) {
        mostrarGraficoRelatorio(
            'doughnut',
            ['Quantidade Total', 'Valor Total'],
            [Number(dados.quantidadeTotal), Number(dados.valorTotal)],
            'Totais do Período'
        );
    } else {
        esconderGraficoRelatorio();
    }
    let html = `<table><thead><tr><th>Período</th><th>Quantidade Total</th><th>Valor Total</th></tr></thead><tbody>`;
    html += `<tr>
        <td>${mostrarValor(dados.periodo?.inicio)} até ${mostrarValor(dados.periodo?.fim)}</td>
        <td>${mostrarValor(dados.quantidadeTotal)}</td>
        <td>${mostrarValor(dados.valorTotal)}</td>
    </tr>`;
    html += '</tbody></table>';
    document.getElementById('conteudo-relatorio').innerHTML = html;
}

async function buscarRelatorioPecasMaisUtilizadas(dataInicio, dataFim) {
    const resp = await fetch(`${API_URL}/relatorios/pecas/mais-utilizadas?dataInicio=${dataInicio}&dataFim=${dataFim}`);
    const dados = await resp.json();
    if(dados && dados.pecas) renderTabelaPecasMaisUtilizadas(dados.pecas);
    else alert(dados.error || 'Erro ao buscar relatório!');
}
function renderTabelaPecasMaisUtilizadas(lista) {
    if (lista && lista.length > 0) {
        mostrarGraficoRelatorio(
            'bar',
            lista.map(item => item.ordemServicoId),
            lista.map(item => Number(item.quantidadeTotal)),
            'Quantidade de Peças por Ordem'
        );
    } else {
        esconderGraficoRelatorio();
    }
    let html = `<table><thead><tr><th>Ordem Serviço</th><th>Data</th><th>Quantidade Total</th><th>Valor Total</th></tr></thead><tbody>`;
    for(const item of lista) {
        html += `<tr><td>${item.ordemServicoId}</td><td>${item.data}</td><td>${item.quantidadeTotal}</td><td>${item.valorTotal}</td></tr>`;
    }
    html += '</tbody></table>';
    document.getElementById('conteudo-relatorio').innerHTML = html;
}

async function buscarRelatorioOSPorFuncionario(dataInicio, dataFim) {
    const resp = await fetch(`${API_URL}/abertura-servico/relatorio/funcionarios?dataInicio=${dataInicio}&dataFim=${dataFim}`);
    const dados = await resp.json();
    if(Array.isArray(dados)) renderTabelaOSPorFuncionario(dados);
    else alert(dados.error || 'Erro ao buscar relatório!');
}
function renderTabelaOSPorFuncionario(lista) {
    if (lista && lista.length > 0) {
        mostrarGraficoRelatorio(
            'bar',
            lista.map(item => item.nomefuncionario),
            lista.map(item => Number(item.totalordens)),
            'Total de Ordens'
        );
    } else {
        esconderGraficoRelatorio();
    }
    let html = `<table><thead><tr><th>Funcionário</th><th>Total Ordens</th></tr></thead><tbody>`;
    for(const item of lista) {
        html += `<tr><td>${mostrarValor(item.nomefuncionario)}</td><td>${mostrarValor(item.totalordens)}</td></tr>`;
    }
    html += '</tbody></table>';
    document.getElementById('conteudo-relatorio').innerHTML = html;
}

async function buscarRelatorioServicosMaisPrestados(dataInicio, dataFim) {
    const resp = await fetch(`${API_URL}/relatorio-servicos?dataInicio=${dataInicio}&dataFim=${dataFim}`);
    const dados = await resp.json();
    if(Array.isArray(dados)) renderTabelaServicosMaisPrestados(dados);
    else alert(dados.error || 'Erro ao buscar relatório!');
}
function renderTabelaServicosMaisPrestados(lista) {
    if (lista && lista.length > 0) {
        mostrarGraficoRelatorio(
            'bar',
            lista.map(item => item.descricaoservico),
            lista.map(item => Number(item.quantidadeservico)),
            'Quantidade de Serviços'
        );
    } else {
        esconderGraficoRelatorio();
    }
    let html = `<table><thead><tr><th>Serviço</th><th>Quantidade</th><th>Receita Total</th></tr></thead><tbody>`;
    for(const item of lista) {
        html += `<tr><td>${mostrarValor(item.descricaoservico)}</td><td>${mostrarValor(item.quantidadeservico)}</td><td>${mostrarValor(item.receitatotal)}</td></tr>`;
    }
    html += '</tbody></table>';
    document.getElementById('conteudo-relatorio').innerHTML = html;
}

// ========== MODAIS ==========
function abrirModal(id) {
    document.getElementById(id).style.display = 'flex';
    // Preencher selects do modal de execução de serviço ao abrir
    if (id === 'modal-execucaoservico') {
        preencherSelectsExecucaoServico();
    }
}
function fecharModal(id) {
    document.getElementById(id).style.display = 'none';
    limparForm(id);
}
function limparForm(modalId) {
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
    if (form && form.id === 'form-funcionario') form.id.value = '';
    if (form && form.id === 'form-veiculo') form.id.value = '';
    if (form && form.id === 'form-peca') form.id.value = '';
    if (form && form.id === 'form-servico') form.id.value = '';
}
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ========== FUNCIONÁRIOS ==========
async function carregarFuncionarios() {
    const tbody = document.querySelector('#tabela-funcionarios tbody');
    tbody.innerHTML = '';
    try {
        const res = await fetch(`${API_URL}/funcionarios`);
        const funcionarios = await res.json();
        funcionarios.forEach(f => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${f.id}</td>
                <td>${f.nome}</td>
                <td>${f.cargo}</td>
                <td>${f.cpf}</td>
                <td>${f.telefone}</td>
                <td>${f.especialidade}</td>
                <td>${f.salario}</td>
                <td>
                    <button class="acao-btn edit" onclick="editarFuncionario(${f.id})"><i class='fa fa-edit'></i></button>
                    <button class="acao-btn delete" onclick="removerFuncionario(${f.id})"><i class='fa fa-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        showToast('Erro ao carregar funcionários');
    }
}
function abrirModalFuncionarioEdicao(func) {
    abrirModal('modal-funcionario');
    document.getElementById('titulo-modal-funcionario').textContent = 'Editar Funcionário';
    const form = document.getElementById('form-funcionario');
    form.elements['id'].value = func.id;
    form.nome.value = func.nome;
    form.cargo.value = func.cargo;
    form.cpf.value = func.cpf;
    form.telefone.value = func.telefone;
    form.especialidade.value = func.especialidade;
    form.salario.value = func.salario;
}
async function editarFuncionario(id) {
    try {
        const res = await fetch(`${API_URL}/funcionarios/${id}`);
        const func = await res.json();
        abrirModalFuncionarioEdicao(func);
    } catch (e) {
        showToast('Erro ao buscar funcionário');
    }
}
async function salvarFuncionario(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.elements['id'].value;
    const dados = {
        nome: form.nome.value,
        cargo: form.cargo.value,
        cpf: form.cpf.value,
        telefone: form.telefone.value,
        especialidade: form.especialidade.value,
        salario: parseFloat(form.salario.value)
    };
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/funcionarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            res = await fetch(`${API_URL}/funcionarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        }
        if (!res.ok) throw new Error('Erro ao salvar funcionário');
        fecharModal('modal-funcionario');
        carregarFuncionarios();
        showToast('Funcionário salvo com sucesso!');
    } catch (e) {
        showToast(e.message);
    }
}
async function removerFuncionario(id) {
    if (!confirm('Tem certeza que deseja remover este funcionário?')) return;
    try {
        const res = await fetch(`${API_URL}/funcionarios/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao remover funcionário');
        carregarFuncionarios();
        showToast('Funcionário removido!');
    } catch (e) {
        showToast(e.message);
    }
}

// ========== VEÍCULOS ==========
async function carregarVeiculos() {
    const tbody = document.querySelector('#tabela-veiculos tbody');
    tbody.innerHTML = '';
    try {
        const res = await fetch(`${API_URL}/veiculos`);
        const veiculos = await res.json();
        veiculos.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${v.id}</td>
                <td>${v.marca}</td>
                <td>${v.modelo}</td>
                <td>${v.ano}</td>
                <td>${v.numeroChassi}</td>
                <td>${v.tipoCombustivel}</td>
                <td>
                    <button class="acao-btn edit" onclick="editarVeiculo(${v.id})"><i class='fa fa-edit'></i></button>
                    <button class="acao-btn delete" onclick="removerVeiculo(${v.id})"><i class='fa fa-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        showToast('Erro ao carregar veículos');
    }
}
function abrirModalVeiculoEdicao(veic) {
    abrirModal('modal-veiculo');
    document.getElementById('titulo-modal-veiculo').textContent = 'Editar Veículo';
    const form = document.getElementById('form-veiculo');
    form.elements['id'].value = veic.id;
    form.marca.value = veic.marca;
    form.modelo.value = veic.modelo;
    form.ano.value = veic.ano;
    form.numeroChassi.value = veic.numeroChassi;
    form.tipoCombustivel.value = veic.tipoCombustivel;
}
async function editarVeiculo(id) {
    try {
        const res = await fetch(`${API_URL}/veiculos/${id}`);
        const veic = await res.json();
        abrirModalVeiculoEdicao(veic);
    } catch (e) {
        showToast('Erro ao buscar veículo');
    }
}
async function salvarVeiculo(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.elements['id'].value;
    const dados = {
        marca: form.marca.value,
        modelo: form.modelo.value,
        ano: parseInt(form.ano.value),
        numeroChassi: form.numeroChassi.value,
        tipoCombustivel: form.tipoCombustivel.value
    };
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/veiculos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            res = await fetch(`${API_URL}/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        }
        if (!res.ok) throw new Error('Erro ao salvar veículo');
        fecharModal('modal-veiculo');
        carregarVeiculos();
        showToast('Veículo salvo com sucesso!');
    } catch (e) {
        showToast(e.message);
    }
}
async function removerVeiculo(id) {
    if (!confirm('Tem certeza que deseja remover este veículo?')) return;
    try {
        const res = await fetch(`${API_URL}/veiculos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao remover veículo');
        carregarVeiculos();
        showToast('Veículo removido!');
    } catch (e) {
        showToast(e.message);
    }
}

// ========== PEÇAS ==========
async function carregarPecas() {
    const tbody = document.querySelector('#tabela-pecas tbody');
    tbody.innerHTML = '';
    try {
        const res = await fetch(`${API_URL}/pecas`);
        const pecas = await res.json();
        pecas.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>${p.estoque}</td>
                <td>
                    <button class="acao-btn edit" onclick="editarPeca(${p.id})"><i class='fa fa-edit'></i></button>
                    <button class="acao-btn delete" onclick="removerPeca(${p.id})"><i class='fa fa-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        showToast('Erro ao carregar peças');
    }
}
function abrirModalPecaEdicao(peca) {
    abrirModal('modal-peca');
    document.getElementById('titulo-modal-peca').textContent = 'Editar Peça';
    const form = document.getElementById('form-peca');
    form.elements['id'].value = peca.id;
    form.nome.value = peca.nome;
    form.estoque.value = peca.estoque;
}
async function editarPeca(id) {
    try {
        const res = await fetch(`${API_URL}/pecas/${id}`);
        const peca = await res.json();
        abrirModalPecaEdicao(peca);
    } catch (e) {
        showToast('Erro ao buscar peça');
    }
}
async function salvarPeca(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.elements['id'].value;
    const dados = {
        nome: form.nome.value,
        estoque: parseInt(form.estoque.value)
    };
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/pecas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            res = await fetch(`${API_URL}/pecas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        }
        if (!res.ok) throw new Error('Erro ao salvar peça');
        fecharModal('modal-peca');
        carregarPecas();
        showToast('Peça salva com sucesso!');
    } catch (e) {
        showToast(e.message);
    }
}
async function removerPeca(id) {
    if (!confirm('Tem certeza que deseja remover esta peça?')) return;
    try {
        const res = await fetch(`${API_URL}/pecas/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao remover peça');
        carregarPecas();
        showToast('Peça removida!');
    } catch (e) {
        showToast(e.message);
    }
}

// ========== SERVIÇOS ==========
async function carregarServicos() {
    const tbody = document.querySelector('#tabela-servicos tbody');
    tbody.innerHTML = '';
    try {
        const res = await fetch(`${API_URL}/servicos`);
        const servicos = await res.json();
        servicos.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.id}</td>
                <td>${s.descricao}</td>
                <td>${s.maoObra}</td>
                <td>${s.categoria}</td>
                <td>
                    <button class="acao-btn edit" onclick="editarServico(${s.id})"><i class='fa fa-edit'></i></button>
                    <button class="acao-btn delete" onclick="removerServico(${s.id})"><i class='fa fa-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        showToast('Erro ao carregar serviços');
    }
}
function abrirModalServicoEdicao(servico) {
    abrirModal('modal-servico');
    document.getElementById('titulo-modal-servico').textContent = 'Editar Serviço';
    const form = document.getElementById('form-servico');
    form.elements['id'].value = servico.id;
    form.descricao.value = servico.descricao;
    form.maoObra.value = servico.maoObra;
    form.categoria.value = servico.categoria;
}
async function editarServico(id) {
    try {
        const res = await fetch(`${API_URL}/servicos/${id}`);
        const servico = await res.json();
        abrirModalServicoEdicao(servico);
    } catch (e) {
        showToast('Erro ao buscar serviço');
    }
}
async function salvarServico(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.elements['id'].value;
    const dados = {
        descricao: form.descricao.value,
        maoObra: parseFloat(form.maoObra.value),
        categoria: form.categoria.value
    };
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/servicos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            res = await fetch(`${API_URL}/servicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        }
        if (!res.ok) throw new Error('Erro ao salvar serviço');
        fecharModal('modal-servico');
        carregarServicos();
        showToast('Serviço salvo com sucesso!');
    } catch (e) {
        showToast(e.message);
    }
}
async function removerServico(id) {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;
    try {
        const res = await fetch(`${API_URL}/servicos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao remover serviço');
        carregarServicos();
        showToast('Serviço removido!');
    } catch (e) {
        showToast(e.message);
    }
}

// ========== ABERTURA DE ORDEM DE SERVIÇO ==========
async function carregarAberturasServico() {
    const tbody = document.querySelector('#tabela-aberturaservico tbody');
    tbody.innerHTML = '';
    try {
        const res = await fetch(`${API_URL}/aberturaservico`);
        const ordens = await res.json();
        for (const o of ordens) {
            // Nome e CPF do cliente podem estar em o.veiculo.cliente
            let nomeCliente = o.nomeCliente || (o.veiculo && o.veiculo.cliente && o.veiculo.cliente.nome) || '-';
            let cpfCliente = o.cpfCliente || (o.veiculo && o.veiculo.cliente && o.veiculo.cliente.cpf) || '-';
            let veiculoDesc = o.veiculo ? `${o.veiculo.modelo} (${o.veiculo.placa || o.veiculo.numeroChassi || '-'})` : '-';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${o.id}</td>
                <td>${o.data}</td>
                <td>${o.servico ? o.servico.descricao : '-'}</td>
                <td>${o.funcionario ? o.funcionario.nome : '-'}</td>
                <td>${nomeCliente}</td>
                <td>${cpfCliente}</td>
                <td>${veiculoDesc}</td>
                <td>
                    <button class="acao-btn edit" onclick="editarAberturaServico(${o.id})"><i class='fa fa-edit'></i></button>
                    <button class="acao-btn delete" onclick="removerAberturaServico(${o.id})"><i class='fa fa-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    } catch (e) {
        showToast('Erro ao carregar ordens de serviço');
    }
}
async function preencherSelectsAberturaServico() {
    // Serviços
    const servicoSel = document.querySelector('#form-aberturaservico select[name="servicoId"]');
    const resServ = await fetch(`${API_URL}/servicos`);
    const servicos = await resServ.json();
    servicoSel.innerHTML = servicos.map(s => `<option value="${s.id}">${s.descricao}</option>`).join('');
    // Funcionários
    const funcSel = document.querySelector('#form-aberturaservico select[name="funcionarioId"]');
    const resFunc = await fetch(`${API_URL}/funcionarios`);
    const funcs = await resFunc.json();
    funcSel.innerHTML = funcs.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
    // Veículos
    const veiSel = document.querySelector('#form-aberturaservico select[name="veiculoId"]');
    const resVei = await fetch(`${API_URL}/veiculos`);
    const veis = await resVei.json();
    veiSel.innerHTML = veis.map(v => `<option value="${v.id}">${v.modelo} (${v.placa||v.numeroChassi})</option>`).join('');
}
function abrirModalAberturaServicoEdicao(ordem) {
    abrirModal('modal-aberturaservico');
    document.getElementById('titulo-modal-aberturaservico').textContent = 'Editar Ordem de Serviço';
    const form = document.getElementById('form-aberturaservico');
    form.elements['id'].value = ordem.id;
    form.data.value = ordem.data;
    form.servicoId.value = ordem.servicoId;
    form.funcionarioId.value = ordem.funcionarioId;
    form.nomeCliente.value = ordem.nomeCliente;
    form.cpfCliente.value = ordem.cpfCliente;
    form.veiculoId.value = ordem.veiculoId;
}
async function editarAberturaServico(id) {
    await preencherSelectsAberturaServico();
    try {
        const res = await fetch(`${API_URL}/aberturaservico/${id}`);
        const ordem = await res.json();
        abrirModalAberturaServicoEdicao(ordem);
    } catch (e) {
        showToast('Erro ao buscar ordem de serviço');
    }
}
async function salvarAberturaServico(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.elements['id'].value;
    const dados = {
        data: form.data.value,
        servicoId: form.servicoId.value,
        funcionarioId: form.funcionarioId.value,
        nomeCliente: form.nomeCliente.value,
        cpfCliente: form.cpfCliente.value,
        veiculoId: form.veiculoId.value
    };
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/aberturaservico/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            res = await fetch(`${API_URL}/aberturaservico`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        }
        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.message || 'Erro ao salvar ordem');
        }
        fecharModal('modal-aberturaservico');
        carregarAberturasServico();
        showToast('Ordem salva com sucesso!');
    } catch (e) {
        showToast(e.message);
    }
}
async function removerAberturaServico(id) {
    if (!confirm('Tem certeza que deseja remover esta ordem?')) return;
    try {
        const res = await fetch(`${API_URL}/aberturaservico/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao remover ordem');
        carregarAberturasServico();
        showToast('Ordem removida!');
    } catch (e) {
        showToast(e.message);
    }
}

// ========== EXECUÇÃO DE SERVIÇO ==========
async function carregarExecucoesServico() {
    const tbody = document.querySelector('#tabela-execucaoservico tbody');
    tbody.innerHTML = '';
    try {
        const res = await fetch(`${API_URL}/ExecucaoServico`);
        const execs = await res.json();
        for (const e of execs) {
            // Forma de pagamento
            const formaPagamento = e.formaPagamento ? e.formaPagamento.descricao : '-';
            // Ordem de serviço (cliente + serviço)
            let ordemServico = '-';
            if (e.aberturaServico) {
                const cliente = e.aberturaServico.veiculo && e.aberturaServico.veiculo.cliente ? e.aberturaServico.veiculo.cliente.nome : '';
                const servico = e.aberturaServico.servico ? e.aberturaServico.servico.descricao : '';
                ordemServico = `${e.aberturaServico.id} - ${cliente} (${servico})`;
            }
            // Desconto
            let desconto = '-';
            if (e.valorComDesconto && e.valorComDesconto < e.valor) {
                desconto = `R$ ${(e.valor - e.valorComDesconto).toFixed(2)}`;
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${e.id}</td>
                <td>${e.valor}</td>
                <td>${e.dataFinalizacao}</td>
                <td>${formaPagamento}</td>
                <td>${ordemServico}</td>
                <td>${desconto}</td>
                <td>
                    <button class="acao-btn edit" onclick="editarExecucaoServico(${e.id})"><i class='fa fa-edit'></i></button>
                    <button class="acao-btn delete" onclick="removerExecucaoServico(${e.id})"><i class='fa fa-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    } catch (e) {
        showToast('Erro ao carregar execuções');
    }
}
async function preencherSelectsExecucaoServico() {
    // Formas de Pagamento
    const fpSel = document.querySelector('#form-execucaoservico select[name="formaPagamentoId"]');
    const resFP = await fetch(`${API_URL}/formaPagamento`);
    const fps = await resFP.json();
    fpSel.innerHTML = fps.map(f => `<option value="${f.id}">${f.descricao}</option>`).join('');
    // Ordens de Serviço
    const osSel = document.querySelector('#form-execucaoservico select[name="aberturaServicoId"]');
    const resOS = await fetch(`${API_URL}/aberturaservico`);
    const oss = await resOS.json();
    osSel.innerHTML = oss.map(o => {
        let cliente = o.veiculo && o.veiculo.cliente ? o.veiculo.cliente.nome : (o.nomeCliente || '');
        let servico = o.servico ? o.servico.descricao : '';
        return `<option value="${o.id}">${o.id} - ${cliente} (${servico})</option>`;
    }).join('');
}
function abrirModalExecucaoServicoEdicao(exec) {
    abrirModal('modal-execucaoservico');
    preencherSelectsExecucaoServico();
    document.getElementById('titulo-modal-execucaoservico').textContent = 'Editar Execução de Serviço';
    const form = document.getElementById('form-execucaoservico');
    form.elements['id'].value = exec.id;
    form.valor.value = exec.valor;
    form.dataFinalizacao.value = exec.dataFinalizacao;
    form.formaPagamentoId.value = exec.formaPagamentoId;
    form.aberturaServicoId.value = exec.aberturaServicoId;
}
async function editarExecucaoServico(id) {
    await preencherSelectsExecucaoServico();
    try {
        const res = await fetch(`${API_URL}/ExecucaoServico/${id}`);
        const exec = await res.json();
        abrirModalExecucaoServicoEdicao(exec);
    } catch (e) {
        showToast('Erro ao buscar execução');
    }
}
async function salvarExecucaoServico(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.elements['id'].value;
    const dados = {
        valor: parseFloat(form.valor.value),
        dataFinalizacao: form.dataFinalizacao.value,
        formaPagamentoId: form.formaPagamentoId.value,
        aberturaServicoId: form.aberturaServicoId.value
    };
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/ExecucaoServico/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            res = await fetch(`${API_URL}/ExecucaoServico`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        }
        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.message || 'Erro ao salvar execução');
        }
        fecharModal('modal-execucaoservico');
        carregarExecucoesServico();
        showToast('Execução salva com sucesso!');
    } catch (e) {
        showToast(e.message);
    }
}
async function removerExecucaoServico(id) {
    if (!confirm('Tem certeza que deseja remover esta execução?')) return;
    try {
        const res = await fetch(`${API_URL}/ExecucaoServico/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao remover execução');
        carregarExecucoesServico();
        showToast('Execução removida!');
    } catch (e) {
        showToast(e.message);
    }
}

// ========== ADIÇÃO DE PEÇA ==========
async function carregarAdicoesPeca() {
    const tbody = document.querySelector('#tabela-adicaopeca tbody');
    tbody.innerHTML = '';
    try {
        // Buscar todas as ordens de serviço com as peças associadas
        const resOrdens = await fetch(`${API_URL}/aberturaservico`);
        const ordens = await resOrdens.json();
        // Montar um array de todas as adições de peça, associando ordem e peça
        let adicoes = [];
        for (const ordem of ordens) {
            if (ordem.pecas && Array.isArray(ordem.pecas)) {
                for (const adicao of ordem.pecas) {
                    adicoes.push({
                        ...adicao,
                        ordemId: ordem.id,
                        nomeCliente: ordem.veiculo && ordem.veiculo.cliente ? ordem.veiculo.cliente.nome : (ordem.nomeCliente || '-'),
                        servico: ordem.servico ? ordem.servico.descricao : '-',
                        pecaNome: adicao.peca ? adicao.peca.nome : (adicao.peca_id || '-')
                    });
                }
            }
        }
        // Exibir na tabela
        for (const a of adicoes) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${a.id}</td>
                <td>${a.ordemId} - ${a.nomeCliente} (${a.servico})</td>
                <td>${a.pecaNome}</td>
                <td>${a.quantidade}</td>
                <td>${a.valor}</td>
                <td>${a.data}</td>
                <td>
                    <button class="acao-btn edit" onclick="editarAdicaoPeca(${a.id},${a.ordemId})"><i class='fa fa-edit'></i></button>
                    <button class="acao-btn delete" onclick="removerAdicaoPeca(${a.id},${a.ordemId})"><i class='fa fa-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    } catch (e) {
        showToast('Erro ao carregar adições de peça');
    }
}

async function preencherSelectsAdicaoPeca() {
    // Ordens de Serviço
    const osSel = document.querySelector('#form-adicaopeca select[name="aberturaServicoId"]');
    const resOS = await fetch(`${API_URL}/aberturaservico`);
    const oss = await resOS.json();
    osSel.innerHTML = oss.map(o => {
        let cliente = o.nomeCliente || (o.veiculo && o.veiculo.cliente && o.veiculo.cliente.nome) || '-';
        let servico = (o.servico && o.servico.descricao) || '-';
        return `<option value="${o.id}">${o.id} - ${cliente} (${servico})</option>`;
    }).join('');
    // Peças
    const pecaSel = document.querySelector('#form-adicaopeca select[name="pecaId"]');
    const resPeca = await fetch(`${API_URL}/pecas`);
    const pecas = await resPeca.json();
    pecaSel.innerHTML = pecas.map(p => `<option value="${p.id}">${p.id} - ${p.nome || p.descricao || '-'}</option>`).join('');
}

function abrirModalAdicaoPecaEdicao(adicao) {
    abrirModal('modal-adicaopeca');
    document.getElementById('titulo-modal-adicaopeca').textContent = 'Editar Adição de Peça';
    const form = document.getElementById('form-adicaopeca');
    form.elements['id'].value = adicao.id;
    form.aberturaServicoId.value = adicao.aberturaServicoId;
    form.pecaId.value = adicao.pecaId;
    form.quantidade.value = adicao.quantidade;
    form.valor.value = adicao.valor;
    form.data.value = adicao.data;
}

async function editarAdicaoPeca(id, aberturaServicoId) {
    await preencherSelectsAdicaoPeca();
    try {
        // Supondo que existe endpoint /aberturaservico/:aberturaServicoId/pecas/:id
        const res = await fetch(`${API_URL}/aberturaservico/${aberturaServicoId}/pecas/${id}`);
        const adicao = await res.json();
        abrirModalAdicaoPecaEdicao(adicao);
    } catch (e) {
        showToast('Erro ao buscar adição de peça');
    }
}

async function salvarAdicaoPeca(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.elements['id'].value;
    const aberturaServicoId = form.aberturaServicoId.value;
    const dados = {
        pecaId: form.pecaId.value,
        quantidade: parseInt(form.quantidade.value),
        valor: parseFloat(form.valor.value),
        data: form.data.value
    };
    try {
        let res;
        if (id) {
            // Supondo que existe endpoint /aberturaservico/:aberturaServicoId/pecas/:id
            res = await fetch(`${API_URL}/aberturaservico/${aberturaServicoId}/pecas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            res = await fetch(`${API_URL}/aberturaservico/${aberturaServicoId}/pecas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...dados, aberturaServicoId })
            });
        }
        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.message || 'Erro ao salvar adição de peça');
        }
        fecharModal('modal-adicaopeca');
        carregarAdicoesPeca();
        showToast('Adição de peça salva com sucesso!');
    } catch (e) {
        showToast(e.message);
    }
}

async function removerAdicaoPeca(id, aberturaServicoId) {
    if (!confirm('Tem certeza que deseja remover esta adição de peça?')) return;
    try {
        // Supondo que existe endpoint /aberturaservico/:aberturaServicoId/pecas/:id
        const res = await fetch(`${API_URL}/aberturaservico/${aberturaServicoId}/pecas/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao remover adição de peça');
        carregarAdicoesPeca();
        showToast('Adição de peça removida!');
    } catch (e) {
        showToast(e.message);
    }
}

// ========== INICIALIZAÇÃO ==========
const secaoProcessos = ['aberturaservico','execucaoservico','adicaopeca'];
document.addEventListener('DOMContentLoaded', () => {
    mostrarSecao('funcionarios');
    // Preencher selects ao abrir modais de processos
    document.getElementById('modal-aberturaservico').addEventListener('click', async (e) => {
        if (e.target.classList.contains('modal')) await preencherSelectsAberturaServico();
    });
    document.getElementById('modal-execucaoservico').addEventListener('click', async (e) => {
        if (e.target.classList.contains('modal')) await preencherSelectsExecucaoServico();
    });
    document.getElementById('modal-adicaopeca').addEventListener('click', async (e) => {
        if (e.target.classList.contains('modal')) await preencherSelectsAdicaoPeca();
    });
});
// Sobrescrever mostrarSecao para carregar dados dos processos
const mostrarSecaoOriginal = mostrarSecao;
window.mostrarSecao = function(secao) {
    mostrarSecaoOriginal(secao);
    if (secao === 'aberturaservico') carregarAberturasServico();
    if (secao === 'execucaoservico') carregarExecucoesServico();
    if (secao === 'adicaopeca') carregarAdicoesPeca();
};
// Fechar modal ao clicar fora do conteúdo
window.onclick = function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            limparForm(modal.id);
        }
    });
};

// Função para abrir modal de nova ordem de serviço e preencher selects
async function abrirModalAberturaServicoNovo() {
    await preencherSelectsAberturaServico();
    abrirModal('modal-aberturaservico');
    document.getElementById('titulo-modal-aberturaservico').textContent = 'Nova Ordem de Serviço';
    const form = document.getElementById('form-aberturaservico');
    form.reset();
    form.elements['id'].value = '';
}

// Adicionar exibição do desconto no modal (apenas visualização)
function mostrarDescontoExecucao(valor, valorComDesconto) {
    const descontoSpan = document.getElementById('desconto-execucao');
    if (!descontoSpan) return;
    if (valor && valorComDesconto && valorComDesconto < valor) {
        descontoSpan.textContent = `Desconto aplicado: R$ ${(valor - valorComDesconto).toFixed(2)}`;
    } else {
        descontoSpan.textContent = '';
    }
}
// Chamar mostrarDescontoExecucao ao editar ou abrir modal de execução
// (Ajustar funções abrirModalExecucaoServicoEdicao e salvarExecucaoServico se necessário)

// ========== ADIÇÃO DE PEÇA ==========
async function abrirModalAdicaoPecaNovo() {
    await preencherSelectsAdicaoPeca();
    abrirModal('modal-adicaopeca');
    document.getElementById('titulo-modal-adicaopeca').textContent = 'Adicionar Peça';
    const form = document.getElementById('form-adicaopeca');
    form.reset();
    form.elements['id'].value = '';
}

function mostrarGraficoRelatorio(tipo, labels, dados, labelDataset) {
    const container = document.getElementById('grafico-relatorio-container');
    const canvas = document.getElementById('grafico-relatorio');
    container.style.display = 'block';
    if (graficoRelatorio) {
        graficoRelatorio.destroy();
    }
    graficoRelatorio = new Chart(canvas, {
        type: tipo,
        data: {
            labels: labels,
            datasets: [{
                label: labelDataset,
                data: dados,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
function esconderGraficoRelatorio() {
    document.getElementById('grafico-relatorio-container').style.display = 'none';
    if (graficoRelatorio) {
        graficoRelatorio.destroy();
        graficoRelatorio = null;
    }
}