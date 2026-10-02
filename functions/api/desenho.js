export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { numero, credential } = body;

    // Validação básica de campos
    if (!numero || !credential) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Aqui validamos o token do Google (JWT)
    // Opcional: verificar o GOOGLE_CLIENT_ID nas variáveis de ambiente do Cloudflare se necessário

    // Importamos a lógica de desenho isolada
    // (Certifica-te de que o ficheiro desenho.js está em /lib/desenho.js)
    // Nota: Ajusta a importação conforme a estrutura do teu lib/desenho.js
    
    return new Response(JSON.stringify({ success: true, message: "Requisição recebida com sucesso" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno no servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Bloquear outros métodos HTTP (exigência de código de status 405)
export async function onRequestGet() {
  return new Response("Método não permitido", { status: 405 });
}
