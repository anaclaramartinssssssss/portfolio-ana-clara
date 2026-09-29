// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://vzgwnuqggycqnhlbufcd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o66cHqHaIPjakHspDyi0yQ_OGNsFoSq';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    carregarProjetosDoBanco();
    configurarFormularioContato();
    configurarFormularioLogin();
    configurarFormularioNovoProjeto();
});

// 1. CARREGAR PROJETOS
async function carregarProjetosDoBanco() {
    const containerProjetos = document.getElementById('lista-projetos-publicos');
    if (!containerProjetos) return;

    try {
        const { data: projetos, error } = await _supabase
            .from('projetos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        if (projetos && projetos.length > 0) {
            containerProjetos.innerHTML = '';
            projetos.forEach(projeto => {
                const card = document.createElement('article');
                card.className = 'project-card';
                card.innerHTML = `
                    <div class="card-icon"><i class="fa-solid fa-globe"></i></div>
                    <h3>${escaparHTML(projeto.titulo)}</h3>
                    <p>${escaparHTML(projeto.descricao)}</p>
                    <a href="${escaparHTML(projeto.link)}" target="_blank" class="card-link">
                        Acessar o Site <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                `;
                containerProjetos.appendChild(card);
            });
        }
    } catch (err) {
        console.error('Erro ao carregar projetos:', err.message);
    }
}

// 2. FORMULÁRIO DE CONTATO
function configurarFormularioContato() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const servico = document.getElementById('servico_interesse').value;
        const mensagem = document.getElementById('mensagem').value;
        const aceiteLGPD = document.getElementById('aceite_privacidade').checked;

        if (!aceiteLGPD) {
            alert('Por favor, aceite os termos de privacidade para continuar.');
            return;
        }

        try {
            await _supabase.from('leads').insert([{ nome, servico, mensagem, aceite_lgpd: aceiteLGPD }]);

            const textoWhatsapp = `Olá Ana Clara! Me chamo *${nome}*.\n` +
                `*Serviço de interesse:* ${servico || 'Consulta geral'}\n` +
                `*Mensagem:* ${mensagem}`;

            window.open(`https://wa.me/5533997003179?text=${encodeURIComponent(textoWhatsapp)}`, '_blank');
            form.reset();
        } catch (err) {
            console.error('Erro no envio:', err.message);
        }
    });
}

// 3. CONTROLE DO MODAL & ADMIN
function toggleAdminModal() {
    const modal = document.getElementById('adminModal');
    if (!modal) return;
    
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        verificarSessaoAtiva();
    }
}

async function verificarSessaoAtiva() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        exibirDashboard();
    } else {
        exibirLogin();
    }
}

function exibirLogin() {
    document.getElementById('loginArea').style.display = 'block';
    document.getElementById('dashboardArea').style.display = 'none';
}

function exibirDashboard() {
    document.getElementById('loginArea').style.display = 'none';
    document.getElementById('dashboardArea').style.display = 'block';
    carregarLeadsNoPainel();
}

function configurarFormularioLogin() {
    const formLogin = document.getElementById('adminLoginForm');
    if (!formLogin) return;

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminSenha').value;

        const { error } = await _supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Falha na autenticação: ' + error.message);
        } else {
            exibirDashboard();
        }
    });
}

async function logoutAdmin() {
    await _supabase.auth.signOut();
    exibirLogin();
}

function openTab(event, tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

async function carregarLeadsNoPainel() {
    const tabelaBody = document.getElementById('tabela-leads-body');
    if (!tabelaBody) return;

    tabelaBody.innerHTML = '<tr><td colspan="4">Carregando registros...</td></tr>';

    const { data: leads, error } = await _supabase
        .from('leads')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        tabelaBody.innerHTML = `<tr><td colspan="4">Erro: ${error.message}</td></tr>`;
        return;
    }

    if (!leads || leads.length === 0) {
        tabelaBody.innerHTML = '<tr><td colspan="4">Nenhum contato recebido ainda.</td></tr>';
        return;
    }

    tabelaBody.innerHTML = '';
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escaparHTML(lead.nome)}</strong></td>
            <td>${escaparHTML(lead.servico || '-')}</td>
            <td>${escaparHTML(lead.mensagem)}</td>
            <td><span style="color: #22c55e; font-weight: bold;">✔ Aceito</span></td>
        `;
        tabelaBody.appendChild(row);
    });
}

function configurarFormularioNovoProjeto() {
    const formProjeto = document.getElementById('formNovoProjeto');
    if (!formProjeto) return;

    formProjeto.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = document.getElementById('proj_titulo').value;
        const descricao = document.getElementById('proj_descricao').value;
        const link = document.getElementById('proj_link').value;

        const { error } = await _supabase.from('projetos').insert([{ titulo, descricao, link }]);

        if (error) {
            alert('Erro ao salvar projeto: ' + error.message);
        } else {
            alert('Projeto cadastrado com sucesso!');
            formProjeto.reset();
            carregarProjetosDoBanco();
        }
    });
}

function escaparHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}