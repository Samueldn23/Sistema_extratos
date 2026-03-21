// ======================================================================
// Sistema de Extratos - JavaScript Completo
// Gerencia transações com requisições HTTP ao servidor Node.js
// ======================================================================

const API_URL = '/api';

let allTransactions = [];
let currentDate = new Date();
let editingId = null;
let editingTransaction = null;
let searchActive = false;

// Mês e anos disponíveis
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Categorias de transações
const categories = {
    'alimentacao': '🍕 Alimentação',
    'transporte': '🚗 Transporte',
    'saude': '🏥 Saúde',
    'lazer': '🎮 Lazer',
    'trabalho': '💼 Trabalho',
    'compras': '🛍️ Compras',
    'outros': '📌 Outros'
};

// ==================== HTTP API Layer Functions ====================

// Fazer requisição GET
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao fazer GET ${endpoint}:`, error);
        throw error;
    }
}

// Fazer requisição POST
async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao fazer POST ${endpoint}:`, error);
        throw error;
    }
}
window.apiPost = apiPost;

// Fazer requisição PUT
async function apiPut(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao fazer PUT ${endpoint}:`, error);
        throw error;
    }
}
window.apiPut = apiPut;

// Fazer requisição DELETE
async function apiDelete(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao fazer DELETE ${endpoint}:`, error);
        throw error;
    }
}
window.apiDelete = apiDelete;

// Fazer requisição PATCH
async function apiPatch(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao fazer PATCH ${endpoint}:`, error);
        throw error;
    }
}
window.apiPatch = apiPatch;

// ==================== Transaction Operations ====================

// Carregar todas as transações
async function loadAllTransactions() {
    try {
        const data = await apiGet('/transactions');
        return data.data || data.transactions || [];
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        return [];
    }
}

// Criar nova transação
async function createTransaction(transaction) {
    return apiPost('/transactions', transaction);
}

// Atualizar transação
async function updateTransaction(id, transaction) {
    return apiPut(`/transactions/${id}`, transaction);
}

// Deletar transação
async function deleteTransactionApi(id) {
    return apiDelete(`/transactions/${id}`);
}

// Atualizar status de pagamento
async function updatePaymentStatus(id, isPaid) {
    return apiPatch(`/transactions/${id}/pago`, { pago: isPaid });
}

// Limpar todas as transações
async function clearAllTransactions() {
    return apiPost('/transactions/clear/all', {});
}

// Importar dados do JSON para o servidor
async function importJsonDataToDB() {
    try {
        const noDataMsg = document.getElementById('no-data-message');
        noDataMsg.style.display = 'block';
        noDataMsg.textContent = '⏳ Importando dados do JSON...';

        let data = null;

        // Tentar buscar dados.json
        try {
            const response = await fetch('dados.json');
            if (response.ok) {
                data = await response.json();
                if (!Array.isArray(data)) {
                    data = [];
                }
                console.log(`✓ Carregado de dados.json: ${data.length} registros`);
            } else {
                throw new Error(`Status HTTP ${response.status}`);
            }
        } catch (fetchError) {
            console.warn('Erro ao buscar dados.json:', fetchError.message);
            noDataMsg.textContent = '⚠️ Arquivo dados.json não encontrado. Clique em 📁 para fazer upload.';
            data = [];
        }

        let count = 0;
        if (data && data.length > 0) {
            // Usar novo endpoint para importação em lote
            try {
                const result = await apiPost('/import-json', { transactions: data });
                count = result.importados || 0;
                noDataMsg.textContent = `✓ ${count} transações importadas com sucesso!`;
                console.log(`✓ Importação concluída: ${count} importadas, ${result.erros || 0} erros`);
                await loadAllTransactions();
            } catch (importError) {
                console.error('Erro ao importar transações:', importError);
                noDataMsg.textContent = `❌ Erro ao importar: ${importError.message}`;
            }
        } else {
            noDataMsg.textContent = '✓ Sistema pronto (sem dados anteriores)';
        }

        setTimeout(() => {
            noDataMsg.style.display = 'none';
        }, 2000);

        return count;
    } catch (error) {
        console.error('Erro geral ao importar dados:', error);
        const noDataMsg = document.getElementById('no-data-message');
        noDataMsg.textContent = `❌ Erro: ${error.message}`;
        return 0;
    }
}

// Formatar valores como moeda brasileira
function formatValue(value) {
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    return formatter.format(value);
}

/**
 * Valida se uma entrada de data é válida
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * Valida se um valor é numérico válido
 */
function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

/**
 * Compara duas datas ISO com segurança (sem problemas de timezone)
 * Retorna: -1 se dateA < dateB, 0 se iguais, 1 se dateA > dateB
 */
function compareISODates(dateA, dateB) {
    const datePartA = dateA.split('T')[0]; // "2025-07-31"
    const datePartB = dateB.split('T')[0]; // "2025-06-30"

    if (datePartA > datePartB) return 1;
    if (datePartA < datePartB) return -1;
    return 0;
}

/**
 * Converte formato de mês (YYYY-MM) para ISO date (YYYY-MM-01T00:00:00)
 */
function monthToDateISO(monthStr) {
    if (!monthStr) return null;
    // monthStr vem do input type="month" no formato "YYYY-MM"
    return `${monthStr}-01T00:00:00`;
}

/**
 * Converte data ISO (YYYY-MM-01T00:00:00) para formato de mês (YYYY-MM)
 */
function dateISOToMonth(dateISO) {
    if (!dateISO) return '';
    // Remove a hora e o restante, deixando apenas YYYY-MM
    return dateISO.split('T')[0].substring(0, 7);
}

/**
 * Converte data local (YYYY-MM-DD) para ISO string preservando data sem conversão de timezone
 * Input: "2025-07-31" → Output: "2025-07-31T00:00:00"
 */
function dateLocalToISO(dateStr) {
    if (!dateStr) return null;
    // Adiciona T00:00:00 sem usar new Date() para evitar problemas de timezone
    return `${dateStr}T00:00:00`;
}

/**
 * Converte ISO string para data local (YYYY-MM-DD)
 * Input: "2025-07-31T00:00:00" → Output: "2025-07-31"
 */
function dateISOToLocal(dateISO) {
    if (!dateISO) return '';
    return dateISO.split('T')[0];
}

/**
 * Formata data ISO para exibição localizada (dd/mm/yyyy)
 */
function formatDateDisplay(dateISO) {
    if (!dateISO) return '—';
    const datePart = dateISO.split('T')[0]; // "2025-07-31"
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Formata data ISO para exibição no formato Mês/Ano (ex: Jan/2026)
 */
function formatMonthDisplay(dateISO) {
    if (!dateISO) return '—';

    const datePart = dateISO.split('T')[0]; // "2025-07-31"
    const [year, month] = datePart.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthName = months[parseInt(month) - 1];

    return `${monthName}/${year}`;
}

/**
 * Mostra notificação temporária do usuário
 */
function showNotification(message, type = 'info', duration = 2000) {
    const noDataMsg = document.getElementById('no-data-message');
    noDataMsg.style.display = 'block';
    noDataMsg.textContent = message;
    if (duration > 0) {
        setTimeout(() => {
            noDataMsg.style.display = 'none';
        }, duration);
    }
}

/**
 * Cria uma linha da tabela com os dados da transação
 */
function createTransactionRow(transaction, monthIndex, year) {
    const row = document.createElement('tr');
    const value = parseFloat(transaction['VALOR']);
    const isPositive = value > 0;
    const isPago = !!transaction.pago; // Converter para booleano (1 ou 0 → true ou false)

    // Extrair dia, mês e ano diretamente da string para evitar problemas de timezone
    const datePart = transaction.DATA.split('T')[0]; // "2025-07-31"
    const [transYear, transMonth, transDay] = datePart.split('-').map(Number);
    const formattedDate = formatDateDisplay(transaction.DATA);

    // Log para debug
    if (!isPositive) {
        console.log(`[ROW] ${transaction.id}: pago=${transaction.pago} (tipo: ${typeof transaction.pago}) → isPago=${isPago} → Botão: ${isPago ? '✓ Pago' : '○ Pagar'}`);
    }

    // Adicionar classe se for despesa paga
    if (!isPositive && isPago) {
        row.classList.add('paid-expense');
    }

    // Adicionar classe se for despesa pendente de outro período
    const isOtherMonth = !(transMonth - 1 === monthIndex && transYear === year);
    if (!isPositive && !isPago && isOtherMonth) {
        row.classList.add('pending-expense');
    }

    // Células
    const dateCell = row.insertCell(0);
    dateCell.textContent = formattedDate;

    // Célula de Data de Referência
    const dateRefCell = row.insertCell(1);
    if (transaction.data_referencia && transaction.data_referencia !== transaction.DATA) {
        const formattedMonthRef = formatMonthDisplay(transaction.data_referencia);
        dateRefCell.textContent = formattedMonthRef;
        dateRefCell.style.color = 'var(--warning-color)'; // Destacar em amarelo
        dateRefCell.title = `Mês de referência: ${formattedMonthRef}`;
    } else {
        dateRefCell.textContent = '—'; // Traço quando igual
        dateRefCell.style.opacity = '0.5';
    }

    const descCell = row.insertCell(2);
    descCell.textContent = (transaction['DESCRIÇÃO'] || transaction['DESCRICAO'] || '').trim();

    const valueCell = row.insertCell(3);
    valueCell.textContent = formatValue(value);
    valueCell.className = isPositive ? 'value-positive' : 'value-negative';

    const typeCell = row.insertCell(4);
    typeCell.innerHTML = `<span class="type-badge ${isPositive ? 'receita' : 'despesa'}">${isPositive ? 'Receita' : 'Despesa'}</span>`;

    // Célula de ações
    const actionCell = row.insertCell(5);
    const actionContainer = document.createElement('div');
    actionContainer.className = 'action-buttons';

    // Botão para marcar como pago (apenas despesas)
    if (!isPositive) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = `btn btn-toggle-pay ${isPago ? 'paid' : ''}`;
        toggleBtn.textContent = isPago ? '✓ Pago' : '○ Pagar';
        toggleBtn.title = isPago ? 'Marcar como não pago' : 'Marcar como pago';
        toggleBtn.onclick = async (e) => {
            e.stopPropagation();
            await togglePaymentStatus(transaction);
        };
        actionContainer.appendChild(toggleBtn);
    }

    // Botão editar
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-edit';
    editBtn.textContent = '✎ Editar';
    editBtn.onclick = (e) => {
        e.stopPropagation();
        openEditTransactionModal(transaction);
    };
    actionContainer.appendChild(editBtn);

    // Botão remover
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Remover';
    deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja remover esta transação?')) {
            await deleteTransaction(transaction.id);
        }
    };
    actionContainer.appendChild(deleteBtn);

    actionCell.appendChild(actionContainer);
    return row;
}

// Gerar ID único
function generateId() {
    return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Atualizar exibição do período
function updatePeriodDisplay() {
    const monthIndex = currentDate.getMonth();
    const year = currentDate.getFullYear();

    document.getElementById('current-month').textContent = months[monthIndex];
    document.getElementById('current-year').textContent = year;
}

// ==================== Limpar Banco de Dados ====================

async function clearAllDatabase() {
    if (!confirm('⚠️ Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        showNotification('⏳ Limpando banco de dados...', 'info', 0);

        await clearAllTransactions();

        allTransactions = [];
        displayTransactions();

        showNotification('✓ Banco de dados apagado com sucesso!', 'success', 2000);
    } catch (error) {
        console.error('Erro ao limpar banco:', error);
        showNotification(`❌ Erro ao limpar banco: ${error.message}`, 'error', 3000);
    }
}

// Carregar dados do JSON
async function loadTransactions() {
    try {
        showNotification('⏳ Carregando transações...', 'info', 0);

        allTransactions = await loadAllTransactions();

        if (allTransactions.length === 0) {
            showNotification('⏳ Nenhuma transação encontrada. Tentando importar dados...', 'info', 0);
            try {
                await importJsonDataToDB();
                allTransactions = await loadAllTransactions();
            } catch (error) {
                console.warn('Erro ao importar dados:', error);
            }
        }

        if (allTransactions.length === 0) {
            showNotification('✓ Sistema pronto (sem dados). Clique em ⬆️ ou 📁 para importar.', 'info', 3000);
        } else {
            showNotification(`✓ ${allTransactions.length} transações carregadas!`, 'success', 2000);
        }

        updatePeriodDisplay();
        displayTransactions();
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        showNotification('❌ Erro ao conectar ao servidor. Tente recarregar a página.', 'error', 0);
    }
}

// Exibir transações filtradas (refatorado para remover duplicação)
function displayTransactions() {
    const tbody = document.getElementById('transactions-body');
    const noDataMsg = document.getElementById('no-data-message');

    // Filtrar por período (mês/ano)
    const monthIndex = currentDate.getMonth();
    const year = currentDate.getFullYear();

    let filtered = allTransactions.filter(t => {
        // Usar data_referencia se existir, senão usar DATA
        const dateToUse = t.data_referencia || t.DATA;
        const date = new Date(dateToUse);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
    });

    // Guardar as transações do mês atual para cálculo de totais (sem vencidas)
    const filteredForSummary = [...filtered];

    // Adicionar despesas não pagas de períodos anteriores (vencidas) - apenas para exibição
    const unpaidExpenses = allTransactions.filter(t => {
        // Usar data_referencia se existir, senão usar DATA
        const dateToUse = t.data_referencia || t.DATA;
        const date = new Date(dateToUse);
        const tMonth = date.getMonth();
        const tYear = date.getFullYear();
        const isExpense = parseFloat(t['VALOR']) < 0;
        const isUnpaid = !t.pago; // Converter para booleano corretamente
        const isVencida = (tYear < year) || (tYear === year && tMonth < monthIndex);
        return isVencida && isExpense && isUnpaid;
    });

    filtered = [...filtered, ...unpaidExpenses];

    // Ordenar por data_referencia (ou DATA se não existir) - ordem crescente
    filtered.sort((a, b) => {
        const dateA = a.data_referencia || a.DATA;
        const dateB = b.data_referencia || b.DATA;
        return compareISODates(dateA, dateB);
    });

    renderTransactionsTable(filtered, monthIndex, year, filteredForSummary);
}

// Filtrar transações por termo de busca (refatorado)
function filterTransactionsBySearch(searchTerm) {
    const monthIndex = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Filtrar por termo de busca em todos os campos
    let filtered = allTransactions.filter(t => {
        const formattedDate = formatDateDisplay(t.DATA); // DD/MM/YYYY
        const description = (t['DESCRIÇÃO'] || t['DESCRICAO'] || '').toLowerCase();
        const value = parseFloat(t['VALOR']);
        const formattedValue = formatValue(value);

        // Procura em data (DD/MM/YYYY)
        const matchesDate = formattedDate.includes(searchTerm);

        // Procura em descrição (case-insensitive)
        const matchesDescription = description.includes(searchTerm);

        // Procura em valor (numérico ou formatado)
        const matchesValue = value.toString().includes(searchTerm) ||
                           formattedValue.toLowerCase().includes(searchTerm);

        return matchesDate || matchesDescription || matchesValue;
    });

    // Ordenar por data (ordem crescente - mais antigas primeiro)
    filtered.sort((a, b) => compareISODates(a.DATA, b.DATA));

    // Usar a mesma função de renderização com searchTerm como contexto
    renderTransactionsTable(filtered, monthIndex, year, filtered, true);
}

/**
 * Renderiza a tabela de transações (função unificada para remover duplicação)
 * @param {Array} filtered - Transações filtradas para exibir
 * @param {Number} monthIndex - Índice do mês atual
 * @param {Number} year - Ano atual
 * @param {Array} filteredForSummary - Transações para calcular resumo
 * @param {Boolean} isSearch - Se é resultado de busca
 */
function renderTransactionsTable(filtered, monthIndex, year, filteredForSummary, isSearch = false) {
    const tbody = document.getElementById('transactions-body');
    const noDataMsg = document.getElementById('no-data-message');

    // Limpar tabela
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.parentElement.style.display = 'none';
        noDataMsg.style.display = 'block';
        noDataMsg.textContent = isSearch
            ? 'Nenhuma transação encontrada com esse critério.'
            : 'Nenhuma transação encontrada para este período.';
        updateSummary([]);
        updateTransactionCount(0);
        return;
    }

    tbody.parentElement.style.display = 'table';
    noDataMsg.style.display = 'none';

    // Popular tabela
    filtered.forEach(transaction => {
        const row = createTransactionRow(transaction, monthIndex, year);
        tbody.appendChild(row);
    });

    updateSummary(filteredForSummary);
    updateTransactionCount(filtered.length);

    // Aplicar visibilidade de colunas
    applyColumnVisibility();
}

// Alternar status de pagamento de despesa
async function togglePaymentStatus(transaction) {
    try {
        // Enviar diretamente o novo status desejado (inverter o atual)
        const newStatus = !transaction.pago;
        console.log(`[TOGGLE] ID: ${transaction.id}`);
        console.log(`[TOGGLE] Pago atual: ${transaction.pago} (tipo: ${typeof transaction.pago})`);
        console.log(`[TOGGLE] Novo status: ${newStatus} (tipo: ${typeof newStatus})`);

        const result = await updatePaymentStatus(transaction.id, newStatus);
        console.log(`[TOGGLE] ✓ Servidor respondeu: ${JSON.stringify(result)}`);

        // Atualizar na memória
        const index = allTransactions.findIndex(t => t.id === transaction.id);
        if (index !== -1) {
            allTransactions[index].pago = result.pago;
            console.log(`[TOGGLE] ✓ Memória atualizada: allTransactions[${index}].pago = ${allTransactions[index].pago}`);
        }

        console.log(`[DISPLAY] Chamando displayTransactions()...`);
        displayTransactions();
        console.log(`[DISPLAY] ✓ displayTransactions() concluído`);
    } catch (error) {
        console.error('[ERROR]', error);
        alert('❌ Erro ao atualizar status de pagamento');
    }
}

// Atualizar resumo
function updateSummary(transactions) {
    let totalReceitas = 0;
    let totalDespesas = 0;

    transactions.forEach(t => {
        const value = parseFloat(t['VALOR']);
        if (value > 0) {
            totalReceitas += value;
        } else {
            totalDespesas += Math.abs(value);
        }
    });

    // Calcular saldo anterior (saldo acumulado até o mês anterior)
    const saldoAnterior = calculatePreviousMonthBalance();

    // Saldo do mês atual
    const saldoMesAtual = totalReceitas - totalDespesas;

    // Saldo total (anterior + atual)
    const saldoTotal = saldoAnterior + saldoMesAtual;

    document.getElementById('total-anterior').textContent = formatValue(saldoAnterior);
    document.getElementById('total-receitas').textContent = formatValue(totalReceitas);
    document.getElementById('total-despesas').textContent = formatValue(totalDespesas);

    const saldoElement = document.getElementById('total-saldo');
    saldoElement.textContent = formatValue(saldoTotal);
    saldoElement.style.color = saldoTotal >= 0 ? '#0d9488' : '#dc2626';
}

// Calcular saldo acumulado dos meses anteriores
function calculatePreviousMonthBalance() {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let saldoAnterior = 0;

    allTransactions.forEach(t => {
        // Usar data_referencia se existir, caso contrário usar DATA
        const dateToUse = t.data_referencia || t.DATA;
        const datePart = dateToUse.split('T')[0]; // "2025-07-31"
        const [transYear, transMonth] = datePart.split('-').map(Number);

        // Verificar se é ANTES do mês/ano atual
        const isBeforeCurrent = transYear < currentYear ||
            (transYear === currentYear && (transMonth - 1) < currentMonth);

        if (isBeforeCurrent) {
            saldoAnterior += parseFloat(t['VALOR']);
        }
    });

    return saldoAnterior;
}

// Deletar transação
async function deleteTransaction(id) {
    try {
        await deleteTransactionApi(id);
        allTransactions = allTransactions.filter(t => t.id !== id);
        displayTransactions();
        alert('✓ Transação removida!');
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        alert('❌ Erro ao remover transação');
    }
}

// Modal Functions
function openAddTransactionModal() {
    editingId = null;
    editingTransaction = null;
    const modal = document.getElementById('addTransactionModal');
    modal.classList.add('active');

    // Definir data como hoje
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    document.getElementById('transactionDate').value = `${year}-${month}-${day}`;
    document.getElementById('transactionForm').reset();
}

function openEditTransactionModal(transaction) {
    editingTransaction = transaction;
    // Se não tem ID (transação do JSON), criar um identificador baseado em DATA-VALOR
    editingId = transaction.id || `json_${transaction.DATA}_${transaction.VALOR}`;

    const modal = document.getElementById('editTransactionModal');
    modal.classList.add('active');

    // Processar data_referencia (converter para formato mês YYYY-MM)
    let monthRefValue = '';
    if (transaction.data_referencia) {
        monthRefValue = dateISOToMonth(transaction.data_referencia);
    }

    const value = Math.abs(parseFloat(transaction['VALOR']));
    const isReceita = parseFloat(transaction['VALOR']) > 0;

    document.getElementById('editTransactionDate').value = dateISOToLocal(transaction.DATA);
    document.getElementById('editTransactionMonthRef').value = monthRefValue; // Preencher mês de referência
    document.getElementById('editTransactionDesc').value = transaction['DESCRIÇÃO'] || '';
    document.getElementById('editTransactionValue').value = value.toFixed(2);
    document.getElementById('editTransactionType').value = isReceita ? 'receita' : 'despesa';
}

function closeAddTransactionModal() {
    const modal = document.getElementById('addTransactionModal');
    modal.classList.remove('active');
    document.getElementById('transactionForm').reset();
}

function closeEditTransactionModal() {
    const modal = document.getElementById('editTransactionModal');
    modal.classList.remove('active');
    document.getElementById('editTransactionForm').reset();
    editingTransaction = null;
    editingId = null;
}

async function saveAddTransaction(event) {
    event.preventDefault();

    try {
        const date = document.getElementById('transactionDate').value;
        const monthRef = document.getElementById('transactionMonthRef').value; // Mês de referência
        const description = document.getElementById('transactionDesc').value;
        const valueStr = document.getElementById('transactionValue').value;
        const type = document.getElementById('transactionType').value;

        // Validação
        if (!date || !isValidDate(date)) {
            alert('❌ Data inválida');
            return;
        }
        if (!description || description.trim().length === 0) {
            alert('❌ Descrição não pode estar vazia');
            return;
        }
        if (description.trim().length > 255) {
            alert('❌ Descrição muito longa (máx 255 caracteres)');
            return;
        }
        if (!valueStr || !isValidNumber(valueStr)) {
            alert('❌ Valor inválido');
            return;
        }

        let value = parseFloat(valueStr);
        if (type === 'despesa') {
            value = -value;
        }

        const newTransaction = {
            id: generateId(),
            DATA: dateLocalToISO(date),
            'DESCRIÇÃO': description.trim(),
            'VALOR': value,
            'CATEGORIA': 'outros',
            pago: false,
            data_referencia: monthRef ? monthToDateISO(monthRef) : undefined // Converter mês para ISO date
        };

        const created = await createTransaction(newTransaction);

        allTransactions.push(created.transaction || created);
        closeAddTransactionModal();
        displayTransactions();
        showNotification('✓ Transação adicionada com sucesso!', 'success', 2000);
    } catch (error) {
        console.error('Erro ao adicionar transação:', error);
        alert(`❌ Erro ao adicionar transação: ${error.message}`);
    }
}

async function saveEditTransaction(event) {
    event.preventDefault();

    if (!editingTransaction) return;

    try {
        const date = document.getElementById('editTransactionDate').value;
        const monthRef = document.getElementById('editTransactionMonthRef').value; // Mês de referência
        const description = document.getElementById('editTransactionDesc').value;
        const valueStr = document.getElementById('editTransactionValue').value;
        const type = document.getElementById('editTransactionType').value;

        // Validação
        if (!date || !isValidDate(date)) {
            alert('❌ Data inválida');
            return;
        }
        if (!description || description.trim().length === 0) {
            alert('❌ Descrição não pode estar vazia');
            return;
        }
        if (description.trim().length > 255) {
            alert('❌ Descrição muito longa (máx 255 caracteres)');
            return;
        }
        if (!valueStr || !isValidNumber(valueStr)) {
            alert('❌ Valor inválido');
            return;
        }

        let value = parseFloat(valueStr);
        if (type === 'despesa') {
            value = -value;
        }

        const updatedTransaction = {
            DATA: dateLocalToISO(date),
            'DESCRIÇÃO': description.trim(),
            'VALOR': value,
            'CATEGORIA': 'outros',
            data_referencia: monthRef ? monthToDateISO(monthRef) : undefined // Converter mês para ISO date
        };

        await updateTransaction(editingId, updatedTransaction);

        const index = allTransactions.findIndex(t => t.id === editingId);
        if (index !== -1) {
            allTransactions[index] = {
                ...allTransactions[index],
                ...updatedTransaction
            };
        }

        closeEditTransactionModal();
        displayTransactions();
        showNotification('✓ Transação editada com sucesso!', 'success', 2000);
    } catch (error) {
        console.error('Erro ao editar transação:', error);
        alert(`❌ Erro ao editar transação: ${error.message}`);
    }
}

// ==================== File Operations ====================

// Processar upload de arquivo JSON
async function handleJsonFileUpload(file) {
    try {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Arquivo muito grande (máx 5MB)');
        }

        showNotification('⏳ Processando arquivo...', 'info', 0);

        const text = await file.text();
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
            throw new Error('Arquivo JSON deve conter um array de transações');
        }

        if (data.length === 0) {
            throw new Error('Arquivo JSON está vazio');
        }

        // Usar novo endpoint para importação em lote
        const result = await apiPost('/import-json', { transactions: data });
        const count = result.importados || 0;

        showNotification(`✓ ${count} transações importadas com sucesso!`, 'success', 2000);
        console.log(`✓ Importação concluída: ${count} importadas, ${result.erros || 0} erros`);

        if (result.errosList && result.errosList.length > 0) {
            console.warn('Erros na importação:', result.errosList);
        }

        allTransactions = await loadAllTransactions();
        displayTransactions();

        return count;
    } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        showNotification(`❌ Erro: ${error.message}`, 'error', 3000);
        return 0;
    }
}

// Exportar banco como arquivo JSON
function exportDatabaseFile() {
    try {
        if (allTransactions.length === 0) {
            alert('⚠️ Nenhuma transação para exportar');
            return;
        }

        const data = JSON.stringify(allTransactions, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `extratos_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('✓ Dados exportados com sucesso!', 'success', 2000);
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert(`❌ Erro ao exportar dados: ${error.message}`);
    }
}

// Importar arquivo de banco
async function importDatabaseFile(file) {
    try {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Arquivo muito grande (máx 5MB)');
        }

        showNotification('⏳ Importando banco de dados...', 'info', 0);

        const text = await file.text();
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
            throw new Error('Arquivo deve conter um array de transações');
        }

        if (data.length === 0) {
            throw new Error('Arquivo está vazio');
        }

        // Usar endpoint de importação em lote
        const result = await apiPost('/import-json', { transactions: data });

        allTransactions = await loadAllTransactions();
        displayTransactions();
        showNotification(`✓ ${result.importados} transações importadas!`, 'success', 2000);
    } catch (error) {
        console.error('Erro ao importar arquivo:', error);
        showNotification(`❌ Erro ao importar: ${error.message}`, 'error', 3000);
    }
}



// ======================================================================
// ==================== Dropdown Menu Helper ========================
// ======================================================================

function setupDropdown(toggleId, menuId) {
    const btn = document.getElementById(toggleId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other dropdown menus first
        document.querySelectorAll('.toolbar-dropdown-menu.active').forEach(m => {
            if (m !== menu) m.classList.remove('active');
        });
        menu.classList.toggle('active');
    });

    menu.addEventListener('click', (e) => {
        // Close menu when clicking an item (but not selects)
        if (e.target.closest('.dropdown-item')) {
            menu.classList.remove('active');
        }
        e.stopPropagation();
    });
}

// Close dropdown menus when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.toolbar-dropdown-menu.active').forEach(m => {
        m.classList.remove('active');
    });
});

// ======================================================================
// ==================== Transaction Count ============================
// ======================================================================

function updateTransactionCount(count) {
    const el = document.getElementById('transaction-count');
    if (el) {
        el.textContent = count > 0 ? `${count} registro${count !== 1 ? 's' : ''}` : '';
    }
}

// ======================================================================
// ==================== Column Filter Management ====================
// ======================================================================

// TOGGLE: Qual versão do filtro usar? (true = inline, false = painel)
const USE_INLINE_FILTER = true;

// Mapa de colunas para índices da tabela
const COLUMN_MAP = {
    'data': 0,
    'data-ref': 1,
    'descricao': 2,
    'valor': 3,
    'tipo': 4,
    'acao': 5
};

// Estado das colunas visíveis
let visibleColumns = {
    'busca': true,
    'data': true,
    'data-ref': true,
    'descricao': true,
    'valor': true,
    'tipo': true,
    'acao': true
};

/**
 * Carrega preferências de colunas do localStorage
 */
function loadColumnPreferences() {
    const saved = localStorage.getItem('columnVisibility');
    if (saved) {
        visibleColumns = JSON.parse(saved);
    }
    applyColumnVisibility();
}

/**
 * Salva preferências de colunas no localStorage
 */
function saveColumnPreferences() {
    localStorage.setItem('columnVisibility', JSON.stringify(visibleColumns));
}

/**
 * Aplica as classes hidden-column à tabela e sincroniza visibilidade da seção de busca
 */
function applyColumnVisibility() {
    const table = document.querySelector('.transactions-table');
    if (!table) return;

    // Sincronizar visibilidade da seção de busca
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
        searchSection.style.display = visibleColumns['busca'] ? 'block' : 'none';
    }

    // Percorrer todas as células (th e td) e aplicar/remover classe hidden-column
    const allCells = table.querySelectorAll('th, td');

    allCells.forEach(cell => {
        // Remover todas as classes hidden-column primeiro
        cell.classList.remove('hidden-column');

        // Determinar qual coluna é esta célula
        let columnIndex = -1;
        if (cell.tagName === 'TH') {
            columnIndex = Array.from(cell.parentElement.children).indexOf(cell);
        } else if (cell.tagName === 'TD') {
            columnIndex = Array.from(cell.parentElement.children).indexOf(cell);
        }

        // Encontrar a coluna correspondente e aplicar classe se necessário
        const columnName = Object.keys(COLUMN_MAP).find(key => COLUMN_MAP[key] === columnIndex);
        if (columnName && !visibleColumns[columnName]) {
            cell.classList.add('hidden-column');
        }
    });
}

/**
 * Sincroniza os checkboxes de ambos os filtros
 */
function syncColumnCheckboxes() {
    // Versão Inline
    const inlineCheckboxes = document.querySelectorAll('#column-filter-inline input[type="checkbox"]');
    inlineCheckboxes.forEach(checkbox => {
        checkbox.checked = visibleColumns[checkbox.dataset.column];
    });

    // Versão Painel
    const panelCheckboxes = document.querySelectorAll('#column-filter-panel input[type="checkbox"]');
    panelCheckboxes.forEach(checkbox => {
        checkbox.checked = visibleColumns[checkbox.dataset.column];
    });
}

/**
 * Atualiza visibilidade de coluna e reaplica à tabela
 */
function toggleColumnVisibility(columnName) {
    visibleColumns[columnName] = !visibleColumns[columnName];
    saveColumnPreferences();
    applyColumnVisibility();
    syncColumnCheckboxes();
}

// ======================================================================
// ==================== Theme Management ==========================
// ======================================================================

// Mapa de temas para layouts padrão associados
const THEME_LAYOUT_MAP = {
    'default': 'modern',      // Padrão → Moderno
    'ocean': 'modern',        // Ocean → Moderno (profissional)
    'forest': 'relaxed',      // Forest → Relaxado (natural)
    'sunset': 'minimalist',   // Sunset → Minimalista (limpo)
    'lavender': 'compact',    // Lavender → Compacto (eficiente)
    'mint': 'modern',         // Mint → Moderno (fresco)
    'rose': 'relaxed'         // Rose → Relaxado (confortável)
};

function initTheme() {
    // Carregar tema de cor (default, ocean, forest, sunset, lavender, mint, rose)
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default';
    if (savedColorTheme !== 'default') {
        document.body.classList.add(`theme-${savedColorTheme}`);
    }

    // Atualizar seletor de cores
    const colorSelector = document.getElementById('theme-selector');
    if (colorSelector) {
        colorSelector.value = savedColorTheme;
    }

    // Carregar estilo de layout (modern, compact, minimalist, relaxed)
    const savedLayout = localStorage.getItem('layoutStyle') || 'modern';
    document.body.classList.add(`layout-${savedLayout}`);

    // Atualizar seletor de layout
    const layoutSelector = document.getElementById('layout-selector');
    if (layoutSelector) {
        layoutSelector.value = savedLayout;
    }

    // Carregar modo claro/escuro
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeButton();
    }
}

function setColorTheme(themeName) {
    // Remover todos os temas de cor
    document.body.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset', 'theme-lavender', 'theme-mint', 'theme-rose');

    // Adicionar novo tema se não for default
    if (themeName !== 'default') {
        document.body.classList.add(`theme-${themeName}`);
    }

    // Salvar preferência de cor
    localStorage.setItem('colorTheme', themeName);

    // ✨ NOVO: Mudar automaticamente o layout associado ao tema
    const associatedLayout = THEME_LAYOUT_MAP[themeName] || 'modern';
    setLayoutStyle(associatedLayout);

    // Atualizar o seletor de layout para refletir a mudança
    const layoutSelector = document.getElementById('layout-selector');
    if (layoutSelector) {
        layoutSelector.value = associatedLayout;
    }
}

function setLayoutStyle(layoutName) {
    // Remover todos os layouts
    document.body.classList.remove('layout-modern', 'layout-compact', 'layout-minimalist', 'layout-relaxed');

    // Adicionar novo layout
    document.body.classList.add(`layout-${layoutName}`);

    // Salvar preferência
    localStorage.setItem('layoutStyle', layoutName);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.getElementById('btn-toggle-theme');
    const isDark = document.body.classList.contains('dark-mode');
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.title = isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro';
}

// ==================== Atualizar Visibilidade de Ações (baseado em autenticação) ====================

/**
 * Atualiza a visibilidade de elementos protegidos baseado no estado de autenticação
 * - Coluna de ações na tabela
 * - Botão de dados
 * Se autenticado: remove a classe 'not-authenticated'
 * Se não autenticado: adiciona a classe 'not-authenticated'
 */
function updateTableAuthStatus() {
    const table = document.querySelector('.transactions-table');
    const dataDropdown = document.getElementById('data-dropdown');

    if (estaoAutenticado()) {
        // Usuário autenticado - mostrar elementos protegidos
        if (table) table.classList.remove('not-authenticated');
        if (dataDropdown) dataDropdown.classList.remove('not-authenticated');
    } else {
        // Usuário não autenticado - ocultar elementos protegidos
        if (table) table.classList.add('not-authenticated');
        if (dataDropdown) dataDropdown.classList.add('not-authenticated');
    }
}

// ======================================================================
// ==================== Search Functions ==============================
// ======================================================================

function executeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const clearBtn = document.getElementById('btn-clear-search');
    if (searchTerm.length === 0) {
        searchActive = false;
        clearBtn.style.display = 'none';
        displayTransactions();
    } else {
        searchActive = true;
        clearBtn.style.display = 'block';
        filterTransactionsBySearch(searchTerm);
    }
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    searchActive = false;
    document.getElementById('btn-clear-search').style.display = 'none';
    displayTransactions();
}

function returnToCurrentMonth() {
    currentDate = new Date();
    updatePeriodDisplay();
    displayTransactions();
}

// ======================================================================
// ==================== DOMContentLoaded ==============================
// ======================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ DOMContentLoaded disparado');

    // ==================== Verificar Autenticação ====================
    // Permite visualizar mesmo sem autenticação
    // Botão de login/logout fica no header

    // Inicializar tema
    initTheme();

    // Carregar preferências de colunas
    loadColumnPreferences();

    // Mostrar/ocultar o filtro baseado na versão escolhida
    if (USE_INLINE_FILTER) {
        document.getElementById('column-filter-inline').style.display = 'flex';
        document.getElementById('column-filter-panel').style.display = 'none';
    } else {
        document.getElementById('column-filter-inline').style.display = 'none';
        // Painel será mostrado quando o usuário clicar em um botão
    }

    loadTransactions();

    // Mostrar botão de login/logout no header
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        if (estaoAutenticado()) {
            mostrarBotaoLogout(headerActions);
        } else {
            mostrarBotaoLogin(headerActions);
        }
    }

    // Atualizar visibilidade da coluna de ações baseado em autenticação
    updateTableAuthStatus();

    // ==================== Event Listeners para Filtro de Colunas ====================

    // Versão Inline - Toggle do popover
    if (USE_INLINE_FILTER) {
        const btnFilterToggle = document.getElementById('btn-filter-toggle-inline');
        const filterPopover = document.getElementById('column-filter-popover');

        if (btnFilterToggle) {
            btnFilterToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                filterPopover.style.display = filterPopover.style.display === 'block' ? 'none' : 'block';
            });
        }

        if (filterPopover) {
            filterPopover.addEventListener('click', (e) => e.stopPropagation());
        }

        // Fechar popover ao clicar fora
        document.addEventListener('click', (e) => {
            if (filterPopover && !filterPopover.contains(e.target) && !btnFilterToggle.contains(e.target)) {
                filterPopover.style.display = 'none';
            }
        });
    }

    // Versão Painel - Checkboxes
    const btnClosePanelEl = document.getElementById('btn-close-filter-panel');
    if (btnClosePanelEl) {
        btnClosePanelEl.addEventListener('click', () => {
            document.getElementById('column-filter-panel').style.display = 'none';
        });
    }

    // Event listeners para todos os checkboxes (ambas versões)
    const allCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"], .filter-checkbox-large input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            toggleColumnVisibility(checkbox.dataset.column);
        });
    });

    // Navigation
    document.getElementById('btn-add-modal').addEventListener('click', openAddTransactionModal);
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updatePeriodDisplay();
        searchActive = false;
        document.getElementById('search-input').value = '';
        document.getElementById('btn-clear-search').style.display = 'none';
        displayTransactions();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updatePeriodDisplay();
        searchActive = false;
        document.getElementById('search-input').value = '';
        document.getElementById('btn-clear-search').style.display = 'none';
        displayTransactions();
    });

    document.getElementById('period-display').addEventListener('click', returnToCurrentMonth);

    // Modal Buttons
    document.getElementById('closeModal').addEventListener('click', closeAddTransactionModal);
    document.getElementById('cancelBtn').addEventListener('click', closeAddTransactionModal);
    document.getElementById('closeEditModal').addEventListener('click', closeEditTransactionModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditTransactionModal);

    // Form Submissions
    document.getElementById('transactionForm').addEventListener('submit', saveAddTransaction);
    document.getElementById('editTransactionForm').addEventListener('submit', saveEditTransaction);

    // Search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', executeSearch);
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') executeSearch(); });
    document.getElementById('btn-clear-search').addEventListener('click', clearSearch);

    // File Operations
    document.getElementById('btn-import-json').addEventListener('click', async () => {
        if (confirm('Deseja importar dados do JSON?')) {
            try {
                const count = await importJsonDataToDB();
                allTransactions = await loadAllTransactions();
                if (searchActive) {
                    filterTransactionsBySearch(document.getElementById('search-input').value.toLowerCase());
                } else {
                    displayTransactions();
                }
                if (count > 0) alert(`✓ ${count} transações importadas!`);
            } catch (error) {
                alert('Erro ao importar dados.');
            }
        }
    });

    document.getElementById('btn-upload-json').addEventListener('click', () => {
        document.getElementById('json-file-input').click();
    });

    document.getElementById('json-file-input').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file && confirm('Deseja importar dados do arquivo?')) {
            await handleJsonFileUpload(file);
        }
        event.target.value = '';
    });

    document.getElementById('btn-export-db').addEventListener('click', exportDatabaseFile);
    document.getElementById('btn-import-db').addEventListener('click', () => {
        document.getElementById('db-file-input').click();
    });

    document.getElementById('db-file-input').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file && confirm('Deseja importar este banco?')) {
            await importDatabaseFile(file);
        }
        event.target.value = '';
    });

    document.getElementById('btn-clear-database').addEventListener('click', clearAllDatabase);
    document.getElementById('btn-toggle-theme').addEventListener('click', toggleTheme);

    // ==================== Dropdown Menus ====================
    setupDropdown('btn-data-menu', 'data-dropdown-menu');
    setupDropdown('btn-appearance-menu', 'appearance-dropdown-menu');

    // Theme Color Selector
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            setColorTheme(e.target.value);
        });
    }

    // Layout Style Selector
    const layoutSelector = document.getElementById('layout-selector');
    if (layoutSelector) {
        layoutSelector.addEventListener('change', (e) => {
            setLayoutStyle(e.target.value);
        });
    }

    // Modal Click Outside
    window.addEventListener('click', (event) => {
        const addModal = document.getElementById('addTransactionModal');
        const editModal = document.getElementById('editTransactionModal');
        if (event.target === addModal) closeAddTransactionModal();
        if (event.target === editModal) closeEditTransactionModal();
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAddTransactionModal();
            closeEditTransactionModal();
        }
    });
});
