const API_URL = 'https://oficina-ifes-backend.onrender.com';

function mostrarSecao(secao) {
    document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');
    document.getElementById(secao).style.display = 'block';
}

// ================= FUNCIONÁRIOS =================
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
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        alert('Erro ao carregar funcionários');
    }
}

async function adicionarFuncionario(event) {
    event.preventDefault();
    const form = event.target;
    const dados = {
        nome: form.nome.value,
        cargo: form.cargo.value,
        cpf: form.cpf.value,
        telefone: form.telefone.value,
        especialidade: form.especialidade.value,
        salario: parseFloat(form.salario.value)
    };
    try {
        const res = await fetch(`${API_URL}/funcionarios/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error('Erro ao adicionar funcionário');
        form.reset();
        carregarFuncionarios();
        alert('Funcionário adicionado com sucesso!');
    } catch (e) {
        alert(e.message);
    }
}

// ================= VEÍCULOS =================
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
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        alert('Erro ao carregar veículos');
    }
}

async function adicionarVeiculo(event) {
    event.preventDefault();
    const form = event.target;
    const dados = {
        marca: form.marca.value,
        modelo: form.modelo.value,
        ano: parseInt(form.ano.value),
        numeroChassi: form.numeroChassi.value,
        tipoCombustivel: form.tipoCombustivel.value
    };
    try {
        const res = await fetch(`${API_URL}/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error('Erro ao adicionar veículo');
        form.reset();
        carregarVeiculos();
        alert('Veículo adicionado com sucesso!');
    } catch (e) {
        alert(e.message);
    }
}

// ================= PEÇAS =================
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
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        alert('Erro ao carregar peças');
    }
}

async function adicionarPeca(event) {
    event.preventDefault();
    const form = event.target;
    const dados = {
        nome: form.nome.value,
        estoque: parseInt(form.estoque.value)
    };
    try {
        const res = await fetch(`${API_URL}/pecas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error('Erro ao adicionar peça');
        form.reset();
        carregarPecas();
        alert('Peça adicionada com sucesso!');
    } catch (e) {
        alert(e.message);
    }
}

// ================= SERVIÇOS =================
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
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        alert('Erro ao carregar serviços');
    }
}

async function adicionarServico(event) {
    event.preventDefault();
    const form = event.target;
    const dados = {
        descricao: form.descricao.value,
        maoObra: parseFloat(form.maoObra.value),
        categoria: form.categoria.value
    };
    try {
        const res = await fetch(`${API_URL}/servicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error('Erro ao adicionar serviço');
        form.reset();
        carregarServicos();
        alert('Serviço adicionado com sucesso!');
    } catch (e) {
        alert(e.message);
    }
}

// ================= INICIALIZAÇÃO =================
document.addEventListener('DOMContentLoaded', () => {
    mostrarSecao('funcionarios');
    carregarFuncionarios();
});