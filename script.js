// peguei os elementos do DOM que a gente precisa manipular
const botoesComprar = document.querySelectorAll('.btn-comprar');
const botoesContratar = document.querySelectorAll('.btn-contratar');
const carrinhoContainer = document.querySelector('.itens-carrinho');
const botaoFinalizar = document.querySelector('.btn-finalizar');
const carrinhoDiv = document.getElementById('carrinho');

// variáveis para o popup/modal (inicialmente vazias)
let popupFundo, popupMensagem, btnConfirmar, btnCancelar;
let itemAguardandoConfirmacao = null; // guardo aqui o serviço enquanto o usuário confirma

// nosso carrinho em memória (simples, array de objetos)
let carrinho = [];

// configura um toast simples na página (cria se não existir)
function setupToast() {
    let existingToast = document.querySelector('.toast');
    if (!existingToast) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = 'Item adicionado ao carrinho!';
        document.body.appendChild(toast);
        return toast;
    }
    return existingToast;
}

// mostra uma mensagem rápida (toast) — uso em várias partes do site
function showToast(message) {
    const toast = setupToast();
    toast.textContent = message;
    toast.classList.add('show');
    pulseCarrinho(); // dá uma chamadinha visual no carrinho também
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// formata número pra mostrar como R$ 12,34
function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

// animação rápida do carrinho (pequeno destaque)
function pulseCarrinho() {
    carrinhoDiv.classList.add('pulse');
    setTimeout(() => {
        carrinhoDiv.classList.remove('pulse');
    }, 300);
}

// atualiza a lista do carrinho no DOM — recria os itens toda vez (simples e direto)
function atualizarCarrinho() {
    carrinhoContainer.innerHTML = '';

    if (carrinho.length === 0) {
        carrinhoContainer.innerHTML = '<p>O carrinho está vazio.</p>';
    }

    let total = 0;

    carrinho.forEach((item, index) => {
        const itemCarrinho = document.createElement('div');
        itemCarrinho.classList.add('item-carrinho');

        const precoFormatado = formatPrice(item.preco);

        itemCarrinho.innerHTML = `
            <span>${item.nome}</span>
            <span class="item-preco">R$ ${precoFormatado}</span>
            <button class="btn-remover" data-index="${index}">Remover</button>
        `;

        carrinhoContainer.appendChild(itemCarrinho);
        total += item.preco;
    });

    // se tiver algo, mostra o total lá embaixo
    if (carrinho.length > 0) {
        const totalDiv = document.createElement('div');
        totalDiv.classList.add('total-carrinho');
        totalDiv.innerHTML = `<hr><strong>Total: R$ ${formatPrice(total)}</strong>`;
        carrinhoContainer.appendChild(totalDiv);
    }

    // adiciona evento aos botões remover (recriados a cada atualização)
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            // aqui eu removo o item pelo índice — simples e claro
            carrinho.splice(index, 1);
            atualizarCarrinho();
            showToast('Item removido do carrinho.');
        });
    });
}

// adiciona um objeto ao carrinho e atualiza a interface
function adicionarAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    atualizarCarrinho();
    showToast(`"${nome}" adicionado ao carrinho!`);
}

// cria o HTML do popup de confirmação (se ainda não existir)
function setupPopup() {
    if (document.querySelector('.popup-fundo')) return;

    const popupHTML = `
        <div class="popup-fundo" style="display:none;">
            <div class="popup-box">
                <h3>Confirmação de Serviço</h3>
                <p class="popup-mensagem"></p>
                <div class="popup-botoes">
                    <button class="btn-cancelar">Cancelar</button>
                    <button class="btn-confirmar">Confirmar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    popupFundo = document.querySelector('.popup-fundo');
    popupMensagem = document.querySelector('.popup-mensagem');
    btnConfirmar = document.querySelector('.btn-confirmar');
    btnCancelar = document.querySelector('.btn-cancelar');
}

// mostra o popup pedindo confirmação antes de contratar um serviço
function showConfirmationPopup(nome, preco) {
    setupPopup();

    const precoFormatado = formatPrice(preco);
    popupMensagem.innerHTML = `Deseja realmente contratar o serviço <strong>${nome}</strong> por <strong>R$ ${precoFormatado}</strong>?`;
    itemAguardandoConfirmacao = { nome, preco };

    // reset simples dos handlers (clone para remover listeners antigos)
    btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
    btnCancelar.replaceWith(btnCancelar.cloneNode(true));

    btnConfirmar = document.querySelector('.btn-confirmar');
    btnCancelar = document.querySelector('.btn-cancelar');

    btnConfirmar.onclick = () => {
        if (itemAguardandoConfirmacao) {
            adicionarAoCarrinho(itemAguardandoConfirmacao.nome, itemAguardandoConfirmacao.preco);
        }
        popupFundo.style.display = 'none';
        itemAguardandoConfirmacao = null;
    };

    btnCancelar.onclick = () => {
        popupFundo.style.display = 'none';
        itemAguardandoConfirmacao = null;
    };

    popupFundo.style.display = 'flex';
}

// ao clicar na área do carrinho (mas não num botão), alterna abrir/fechar
carrinhoDiv.addEventListener('click', (event) => {
    if (!event.target.closest('button')) {
        carrinhoDiv.classList.toggle('ativo');
    }
});

// botões de comprar produtos — leio nome e preço do card e adiciono ao carrinho
botoesComprar.forEach(botao => {
    botao.addEventListener('click', (e) => {
        const produto = e.target.closest('.produto');
        const nome = produto.querySelector('.nome-produto').textContent.trim();

        let precoTexto = produto.querySelector('.preco-produto').textContent;
        precoTexto = precoTexto.replace('R$', '').trim().replace(',', '.');
        const preco = parseFloat(precoTexto);

        if (!isNaN(preco)) {
            adicionarAoCarrinho(nome, preco);
            // abre o carrinho pra visual feedback
            if (!carrinhoDiv.classList.contains('ativo')) {
                carrinhoDiv.classList.add('ativo');
            }
        } else {
            console.error('Erro ao parsear preço do produto:', precoTexto);
        }
    });
});

// botões de contratar serviço — abrem o popup de confirmação
botoesContratar.forEach(botao => {
    botao.addEventListener('click', () => {
        const nome = botao.dataset.servico;
        const preco = parseFloat(botao.dataset.preco);

        if (!isNaN(preco)) {
            showConfirmationPopup(nome, preco);
        } else {
            console.error('Erro ao parsear preço do serviço:', botao.dataset.preco);
        }
    });
});

// finalizar compra — aqui só mostro um alert e limpo o carrinho (simples)
botaoFinalizar.addEventListener('click', () => {
    if (carrinho.length === 0) {
        showToast('O carrinho está vazio!');
        pulseCarrinho();
        return;
    }

    let total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    alert(`🎉 Compra finalizada com sucesso!\nTotal: R$ ${formatPrice(total)}\nObrigado por escolher o Mundo Pet!`);

    carrinho = [];
    atualizarCarrinho();
    carrinhoDiv.classList.remove('ativo');
});

// quando a página carrega, inicializo o que precisa
document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();
    setupToast();
    setupPopup();
});