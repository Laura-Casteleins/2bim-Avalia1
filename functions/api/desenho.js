import { gerarDesenho } from '../../lib/desenho.js';

// Função auxiliar para descodificar o Token do Google e extrair o e-mail
function obterEmailDoToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).email;
  } catch (e) {
    return null;
  }
}

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const { numero, credential } = body;

    // 1. Validar se recebemos os dados
    if (!numero || !credential) {
      return new Response(JSON.stringify({ error: "Dados incompletos. Faça login e escolha um número." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Extrair o e-mail do token do Google
    const email = obterEmailDoToken(credential);
    if (!email) {
      return new Response(JSON.stringify({ error: "Token do Google inválido." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Gerar o desenho usando a função isolada da pasta /lib
    const svgGerado = gerarDesenho(numero, email);

    // 4. Devolver o SVG e o e-mail para o frontend
    return new Response(JSON.stringify({ svg: svgGerado, email: email }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno no servidor: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Bloquear acessos diretos (via GET)
export async function onRequestGet() {
  return new Response("Método HTTP não permitido. Use POST.", { status: 405 });
}
