import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;

  if (request.method !== "POST") {
    return new Response("Método não permitido.", {
      status: 405
    });
  }

  let dados;

  try {
    dados = await request.json();
  } catch {
    return new Response("Dados inválidos.", {
      status: 400
    });
  }

  if (!dados || !numeroValido(dados.numero)) {
    return new Response("Número inválido.", {
      status: 400
    });
  }

  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return new Response("Token não informado.", {
      status: 401
    });
  }

  const token = authorization.substring(7);

  try {
    const resposta = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" +
      encodeURIComponent(token)
    );

    if (!resposta.ok) {
      return new Response("Token inválido.", {
        status: 401
      });
    }

    const usuario = await resposta.json();

    const clientId = String(env.GOOGLE_CLIENT_ID || "").trim();

    const emailVerificado =
      usuario.email_verified === true ||
      usuario.email_verified === "true";

    if (
      usuario.aud !== clientId ||
      !emailVerificado ||
      !usuario.email
    ) {
      return new Response("Token inválido.", {
        status: 401
      });
    }

    const svg = gerarDesenho(dados.numero, usuario.email);

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml"
      }
    });

  } catch {
    return new Response("Erro ao verificar o token.", {
      status: 401
    });
  }
}
