 // ======================================================
// CONFIGURAÇÃO DO SUPABASE
// ======================================================

const SUPABASE_URL = 'https://vzgwnuqggycqnhlbufcd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o66cHqHaIPjakHspDyi0yQ_OGNsFoSq';

const _supabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener('DOMContentLoaded', () => {

    carregarProjetosDoBanco();

    configurarFormularioContato();

    configurarFormularioLogin();

    configurarFormularioNovoProjeto();

    configurarFormularioNovoUsuario();

    verificarSessaoInicial();
});


// ======================================================
// VERIFICAR SESSÃO AO ABRIR A PÁGINA
// ======================================================

async function verificarSessaoInicial() {

    const {
        data: { session }
    } = await _supabase.auth.getSession();

    if (session) {
        console.log('Usuário logado:', session.user.email);
    }
}


// ======================================================
// 1. CARREGAR PROJETOS
// ======================================================

async function carregarProjetosDoBanco() {

    const containerProjetos =
        document.getElementById('lista-projetos-publicos');

    if (!containerProjetos) return;

    try {

        const { data: projetos, error } = await _supabase
            .from('projetos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        if (!projetos || projetos.length === 0) {

            containerProjetos.innerHTML = `
                <p>Nenhum projeto cadastrado ainda.</p>
            `;

            return;
        }

        containerProjetos.innerHTML = '';

        projetos.forEach(projeto => {

            const card = document.createElement('article');

            card.className = 'project-card';

            card.innerHTML = `
                <div class="card-icon">
                    <i class="fa-solid fa-globe"></i>
                </div>

                <h3>
                    ${escaparHTML(projeto.titulo)}
                </h3>

                <p>
                    ${escaparHTML(projeto.descricao)}
                </p>

                <a 
                    href="${escaparHTML(projeto.link)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="card-link"
                >
                    Acessar o Site
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            `;

            containerProjetos.appendChild(card);
        });

    } catch (err) {

        console.error(
            'Erro ao carregar projetos:',
            err.message
        );
    }
}


// ======================================================
// 2. FORMULÁRIO DE CONTATO
// ======================================================

function configurarFormularioContato() {

    const form =
        document.getElementById('contactForm');

    if (!form) return;

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const nome =
            document.getElementById('nome')?.value.trim();

        const servico =
            document.getElementById('servico_interesse')?.value.trim();

        const mensagem =
            document.getElementById('mensagem')?.value.trim();

        const aceiteLGPD =
            document.getElementById('aceite_privacidade')?.checked;

        if (!nome || !mensagem) {

            alert('Preencha os campos obrigatórios.');

            return;
        }

        if (!aceiteLGPD) {

            alert(
                'Por favor, aceite os termos de privacidade para continuar.'
            );

            return;
        }

        try {

            const { error } = await _supabase
                .from('leads')
                .insert([
                    {
                        nome: nome,
                        servico: servico,
                        mensagem: mensagem,
                        aceite_lgpd: aceiteLGPD
                    }
                ]);

            if (error) throw error;

            const textoWhatsapp =
                `Olá Ana Clara! Me chamo *${nome}*.\n` +
                `*Serviço de interesse:* ${servico || 'Consulta geral'}\n` +
                `*Mensagem:* ${mensagem}`;

            window.open(
                `https://wa.me/5533997003179?text=${encodeURIComponent(textoWhatsapp)}`,
                '_blank'
            );

            form.reset();

            alert('Mensagem enviada com sucesso!');

        } catch (err) {

            console.error(
                'Erro no envio:',
                err.message
            );

            alert(
                'Não foi possível enviar sua mensagem.'
            );
        }
    });
}


// ======================================================
// 3. ABRIR / FECHAR MODAL ADMIN
// ======================================================

function toggleAdminModal() {

    const modal =
        document.getElementById('adminModal');

    if (!modal) return;

    if (modal.style.display === 'flex') {

        modal.style.display = 'none';

    } else {

        modal.style.display = 'flex';

        verificarSessaoAtiva();
    }
}


// ======================================================
// 4. VERIFICAR LOGIN
// ======================================================

async function verificarSessaoAtiva() {

    const {
        data: { session }
    } = await _supabase.auth.getSession();

    if (session) {

        exibirDashboard();

    } else {

        exibirLogin();
    }
}


// ======================================================
// 5. MOSTRAR LOGIN
// ======================================================

function exibirLogin() {

    const loginArea =
        document.getElementById('loginArea');

    const dashboardArea =
        document.getElementById('dashboardArea');

    if (loginArea) {
        loginArea.style.display = 'block';
    }

    if (dashboardArea) {
        dashboardArea.style.display = 'none';
    }
}


// ======================================================
// 6. MOSTRAR DASHBOARD
// ======================================================

function exibirDashboard() {

    const loginArea =
        document.getElementById('loginArea');

    const dashboardArea =
        document.getElementById('dashboardArea');

    if (loginArea) {
        loginArea.style.display = 'none';
    }

    if (dashboardArea) {
        dashboardArea.style.display = 'block';
    }

    carregarLeadsNoPainel();

    carregarUsuariosNoPainel();

    carregarProjetosNoPainel();
}


// ======================================================
// 7. LOGIN DO ADMINISTRADOR
// ======================================================

function configurarFormularioLogin() {

    const formLogin =
        document.getElementById('adminLoginForm');

    if (!formLogin) return;

    formLogin.addEventListener('submit', async (e) => {

        e.preventDefault();

        const email =
            document.getElementById('adminEmail')?.value.trim();

        const password =
            document.getElementById('adminSenha')?.value;

        if (!email || !password) {

            alert(
                'Digite seu e-mail e sua senha.'
            );

            return;
        }

        try {

            const { data, error } =
                await _supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) throw error;

            console.log(
                'Login realizado:',
                data.user.email
            );

            alert('Login realizado com sucesso!');

            exibirDashboard();

        } catch (err) {

            console.error(
                'Erro no login:',
                err.message
            );

            alert(
                'Falha na autenticação: ' +
                err.message
            );
        }
    });
}


// ======================================================
// 8. LOGOUT
// ======================================================

async function logoutAdmin() {

    try {

        const { error } =
            await _supabase.auth.signOut();

        if (error) throw error;

        exibirLogin();

        alert('Você saiu da conta.');

    } catch (err) {

        console.error(
            'Erro ao sair:',
            err.message
        );
    }
}


// ======================================================
// 9. TROCA DE ABAS
// ======================================================

function openTab(event, tabId) {

    document
        .querySelectorAll('.tab-content')
        .forEach(tab => {

            tab.classList.remove('active');
        });

    document
        .querySelectorAll('.tab-btn')
        .forEach(btn => {

            btn.classList.remove('active');
        });

    const aba =
        document.getElementById(tabId);

    if (aba) {

        aba.classList.add('active');
    }

    if (event?.currentTarget) {

        event.currentTarget.classList.add('active');
    }
}


// ======================================================
// 10. CARREGAR LEADS NO PAINEL
// ======================================================

async function carregarLeadsNoPainel() {

    const tabelaBody =
        document.getElementById('tabela-leads-body');

    if (!tabelaBody) return;

    tabelaBody.innerHTML = `
        <tr>
            <td colspan="4">
                Carregando registros...
            </td>
        </tr>
    `;

    try {

        const { data: leads, error } =
            await _supabase
                .from('leads')
                .select('*')
                .order('id', { ascending: false });

        if (error) throw error;

        if (!leads || leads.length === 0) {

            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Nenhum contato recebido ainda.
                    </td>
                </tr>
            `;

            return;
        }

        tabelaBody.innerHTML = '';

        leads.forEach(lead => {

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>
                    <strong>
                        ${escaparHTML(lead.nome)}
                    </strong>
                </td>

                <td>
                    ${escaparHTML(
                        lead.servico || '-'
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        lead.mensagem || '-'
                    )}
                </td>

                <td>
                    <span
                        style="
                            color:#22c55e;
                            font-weight:bold;
                        "
                    >
                        ✔ Aceito
                    </span>
                </td>
            `;

            tabelaBody.appendChild(row);
        });

    } catch (err) {

        console.error(
            'Erro ao carregar leads:',
            err.message
        );

        tabelaBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Erro ao carregar contatos.
                </td>
            </tr>
        `;
    }
}


// ======================================================
// 11. CARREGAR USUÁRIOS
// ======================================================

async function carregarUsuariosNoPainel() {

    const tabelaBody =
        document.getElementById('tabela-usuarios-body');

    if (!tabelaBody) return;

    tabelaBody.innerHTML = `
        <tr>
            <td colspan="5">
                Carregando usuários...
            </td>
        </tr>
    `;

    try {

        const { data: usuarios, error } =
            await _supabase
                .from('usuarios')
                .select('id, nome, email, telefone, criado_em')
                .order('id', { ascending: false });

        if (error) throw error;

        if (!usuarios || usuarios.length === 0) {

            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Nenhum usuário cadastrado.
                    </td>
                </tr>
            `;

            return;
        }

        tabelaBody.innerHTML = '';

        usuarios.forEach(usuario => {

            const row =
                document.createElement('tr');

            const dataCadastro =
                usuario.criado_em
                    ? new Date(usuario.criado_em)
                        .toLocaleDateString('pt-BR')
                    : '-';

            row.innerHTML = `
                <td>
                    ${usuario.id}
                </td>

                <td>
                    <strong>
                        ${escaparHTML(
                            usuario.nome
                        )}
                    </strong>
                </td>

                <td>
                    ${escaparHTML(
                        usuario.email
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        usuario.telefone || '-'
                    )}
                </td>

                <td>
                    ${dataCadastro}
                </td>
            `;

            tabelaBody.appendChild(row);
        });

    } catch (err) {

        console.error(
            'Erro ao carregar usuários:',
            err.message
        );

        tabelaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Erro ao carregar usuários:
                    ${escaparHTML(err.message)}
                </td>
            </tr>
        `;
    }
}


// ======================================================
// 12. CADASTRAR USUÁRIO NA TABELA
// ======================================================

function configurarFormularioNovoUsuario() {

    const form =
        document.getElementById('formNovoUsuario');

    if (!form) return;

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const nome =
            document.getElementById('usuario_nome')
                ?.value.trim();

        const email =
            document.getElementById('usuario_email')
                ?.value.trim();

        const telefone =
            document.getElementById('usuario_telefone')
                ?.value.trim();

        if (!nome || !email) {

            alert(
                'Preencha o nome e o e-mail.'
            );

            return;
        }

        try {

            const { error } =
                await _supabase
                    .from('usuarios')
                    .insert([
                        {
                            nome: nome,
                            email: email,
                            telefone: telefone
                        }
                    ]);

            if (error) throw error;

            alert(
                'Usuário cadastrado com sucesso!'
            );

            form.reset();

            carregarUsuariosNoPainel();

        } catch (err) {

            console.error(
                'Erro ao cadastrar usuário:',
                err.message
            );

            alert(
                'Erro ao cadastrar usuário: ' +
                err.message
            );
        }
    });
}


// ======================================================
// 13. NOVO PROJETO
// ======================================================

function configurarFormularioNovoProjeto() {

    const formProjeto =
        document.getElementById('formNovoProjeto');

    if (!formProjeto) return;

    formProjeto.addEventListener('submit', async (e) => {

        e.preventDefault();

        const titulo =
            document.getElementById('proj_titulo')
                ?.value.trim();

        const descricao =
            document.getElementById('proj_descricao')
                ?.value.trim();

        const link =
            document.getElementById('proj_link')
                ?.value.trim();

        if (!titulo || !descricao || !link) {

            alert(
                'Preencha todos os campos do projeto.'
            );

            return;
        }

        try {

            const { error } =
                await _supabase
                    .from('projetos')
                    .insert([
                        {
                            titulo: titulo,
                            descricao: descricao,
                            link: link
                        }
                    ]);

            if (error) throw error;

            alert(
                'Projeto cadastrado com sucesso!'
            );

            formProjeto.reset();

            carregarProjetosDoBanco();

            carregarProjetosNoPainel();

        } catch (err) {

            console.error(
                'Erro ao salvar projeto:',
                err.message
            );

            alert(
                'Erro ao salvar projeto: ' +
                err.message
            );
        }
    });
}


// ======================================================
// 14. CARREGAR PROJETOS NO PAINEL
// ======================================================

async function carregarProjetosNoPainel() {

    const tabelaBody =
        document.getElementById(
            'tabela-projetos-body'
        );

    if (!tabelaBody) return;

    tabelaBody.innerHTML = `
        <tr>
            <td colspan="4">
                Carregando projetos...
            </td>
        </tr>
    `;

    try {

        const { data: projetos, error } =
            await _supabase
                .from('projetos')
                .select('*')
                .order('id', { ascending: false });

        if (error) throw error;

        if (!projetos || projetos.length === 0) {

            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Nenhum projeto cadastrado.
                    </td>
                </tr>
            `;

            return;
        }

        tabelaBody.innerHTML = '';

        projetos.forEach(projeto => {

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>
                    ${projeto.id}
                </td>

                <td>
                    ${escaparHTML(
                        projeto.titulo
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        projeto.descricao
                    )}
                </td>

                <td>
                    <a
                        href="${escaparHTML(
                            projeto.link
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ver projeto
                    </a>
                </td>
            `;

            tabelaBody.appendChild(row);
        });

    } catch (err) {

        console.error(
            'Erro ao carregar projetos no painel:',
            err.message
        );

        tabelaBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Erro ao carregar projetos.
                </td>
            </tr>
        `;
    }
}


// ======================================================
// 15. PROTEÇÃO CONTRA HTML MALICIOSO
// ======================================================

function escaparHTML(str) {

    if (str === null || str === undefined) {
        return '';
    }

    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
