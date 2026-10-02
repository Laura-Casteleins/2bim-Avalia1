const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let idToken = "";
let svgAtual = "";

window.handleCredentialResponse = function (response) {
  idToken = response.credential;
  mensagem.textContent = "Login realizado com sucesso.";
};

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mensagem.textContent = "";
  area.innerHTML = "";
  botaoBaixar.hidden = true;

  const numero = Number(campoNumero.value);

  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }

  if (!idToken) {
    mensagem.textContent = "Faça login com o Google antes de gerar o desenho.";
    return;
  }

  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({
        numero: numero
      })
    });

    if (resposta.status === 400) {
      mensagem.textContent = "Número inválido.";
      return;
    }

    if (resposta.status === 401) {
      mensagem.textContent = "Autenticação inválida. Faça login novamente.";
      return;
    }

    if (!resposta.ok) {
      mensagem.textContent = "Não foi possível gerar o desenho.";
      return;
    }

    svgAtual = await resposta.text();

    area.innerHTML = svgAtual;
    botaoBaixar.hidden = false;

  } catch {
    mensagem.textContent = "Erro ao comunicar com o servidor.";
  }
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], {
    type: "image/svg+xml"
  });

  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");

  link.href = url;
  link.download = "exemplo.svg";
  link.click();

  URL.revokeObjectURL(url);
});
