const botoesComprar = document.querySelectorAll('.btn-comprar');
const botoesContratar = document.querySelectorAll('.btn-contratar');
const carrinhoContainer = document.querySelector('.itens-carrinho');
const botaoFinalizar = document.querySelector('.btn-finalizar');
const carrinhoDiv = document.getElementById('carrinho');

let popupFundo, popupMensagem, btnConfirmar, btnCancelar;
let itemAguardandoConfirmacao = null;

let carrinho = [];

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

function showToast(message) {
    const toast = setupToast(); 
    toast.textContent = message;
    toast.classList.add('show');
    pulseCarrinho(); 
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

function pulseCarrinho() {
    carrinhoDiv.classList.add('pulse');
    setTimeout(() => {
        carrinhoDiv.classList.remove('pulse');
    }, 300);
}

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

    if (carrinho.length > 0) {
        const totalDiv = document.createElement('div');
        totalDiv.classList.add('total-carrinho');
        totalDiv.innerHTML = `<hr><strong>Total: R$ ${formatPrice(total)}</strong>`;
        carrinhoContainer.appendChild(totalDiv);
    }

    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            // Usa splice para remover o item pelo índice
            carrinho.splice(index, 1);
            atualizarCarrinho();
            showToast('Item removido do carrinho.');
        });
    });
}

function adicionarAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    atualizarCarrinho();
    showToast(`"${nome}" adicionado ao carrinho!`);
}

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

function showConfirmationPopup(nome, preco) {
    setupPopup();

    const precoFormatado = formatPrice(preco);
    popupMensagem.innerHTML = `Deseja realmente contratar o serviço <strong>${nome}</strong> por <strong>R$ ${precoFormatado}</strong>?`;
    itemAguardandoConfirmacao = { nome, preco };

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

carrinhoDiv.addEventListener('click', (event) => {
    if (!event.target.closest('button')) {
        carrinhoDiv.classList.toggle('ativo');
    }
});

botoesComprar.forEach(botao => {
    botao.addEventListener('click', (e) => {
        const produto = e.target.closest('.produto');
        const nome = produto.querySelector('.nome-produto').textContent.trim();

        let precoTexto = produto.querySelector('.preco-produto').textContent;
        precoTexto = precoTexto.replace('R$', '').trim().replace(',', '.');
        const preco = parseFloat(precoTexto);

        if (!isNaN(preco)) {
            adicionarAoCarrinho(nome, preco);
            if (!carrinhoDiv.classList.contains('ativo')) {
                carrinhoDiv.classList.add('ativo');
            }
        } else {
            console.error('Erro ao parsear preço do produto:', precoTexto);
        }
    });
});

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

document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();
    setupToast(); 
    setupPopup(); 
});