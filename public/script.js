let tokenGoogle = null;

// Função chamada automaticamente pelo Google Sign-In após o login bem-sucedido
window.handleCredentialResponse = function(response) {
  tokenGoogle = response.credential;
  console.log("Login efetuado com sucesso!");
  
  // Habilita o botão de desenhar após o login
  const btnDesenhar = document.getElementById("btn-desenhar");
  if (btnDesenhar) {
    btnDesenhar.disabled = false;
  }
  
  const mensagem = document.getElementById("mensagem");
  mensagem.textContent = "Autenticado com sucesso! Escolha um número e clique em Desenhar.";
  mensagem.style.color = "green";
};

document.getElementById("formulario").addEventListener("submit", async function(event) {
  event.preventDefault();

  const numeroInput = document.getElementById("numero").value;
  const mensagem = document.getElementById("mensagem");
  const figura = document.getElementById("desenho");
  const botaoBaixar = document.getElementById("baixar");

  if (!tokenGoogle) {
    mensagem.textContent = "Por favor, faça login com o Google primeiro.";
    mensagem.style.color = "red";
    return;
  }

  const numero = parseInt(numeroInput, 10);
  if (isNaN(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Por favor, insira um número válido entre 1 e 100.";
    mensagem.style.color = "red";
    return;
  }

  mensagem.textContent = "A gerar desenho no servidor...";
  mensagem.style.color = "blue";
  figura.innerHTML = "";
  botaoBaixar.hidden = true;

  try {
    // Requisição para a nossa Cloudflare Pages Function (/api/desenho)
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        numero: numero,
        credential: tokenGoogle
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao comunicar com o servidor.");
    }

    // Exibe o desenho SVG retornado pelo servidor e assinado
    figura.innerHTML = dados.svg;
    mensagem.textContent = `Desenho gerado e assinado para: ${dados.email}`;
    mensagem.style.color = "green";

    // Configura o botão de baixar
    botaoBaixar.hidden = false;
    botaoBaixar.onclick = function() {
      const blob = new Blob([dados.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `desenho_${numero}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    };

  } catch (erro) {
    mensagem.textContent = `Erro: ${erro.message}`;
    mensagem.style.color = "red";
  }
});
