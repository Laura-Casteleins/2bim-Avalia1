// script.js
// Versao inicial: todo o trabalho acontece no navegador.
// A tarefa consiste em levar gerarDesenho para o servidor (Pages Functions)
// e fazer esta pagina apenas enviar o numero e exibir a resposta.

import { gerarDesenho, numeroValido } from "./desenho.js";

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const campoEmail = document.getElementById("email");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);
  const email = campoEmail.value.trim();

  if (!numeroValido(numero)) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }
  if (email === "") {
    mensagem.textContent = "Informe um e-mail.";
    return;
  }

  svgAtual = gerarDesenho(numero, email);
  area.innerHTML = svgAtual;
  botaoBaixar.hidden = false;
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});
