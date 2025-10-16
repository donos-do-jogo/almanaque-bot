const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const persona = process.env.SYSTEM_PROMPT;

function jsonResponse(statusCode, bodyObj) {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyObj),
    };
}

// --- ✅ LÓGICA MOVIDA PARA FUNÇÕES SEPARADAS PARA MAIOR CLAREZA ---

async function handleChatRequest(prompt, history) {
    if (!persona) throw new Error("SYSTEM_PROMPT env variable is not set");

    const systemInstruction = { role: 'user', parts: [{ text: persona }] };

    const contents = [
        ...history.map(h => ({
            role: h.role === 'assistant' ? "model" : "user",
            parts: [{ text: h.content }]
        })),
        { role: "user", parts: [{ text: prompt }] }
    ];

    const payload = { systemInstruction, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 8192 } };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEN_API_KEY },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const txt = await res.text();
        console.error("Gemini API non-200:", res.status, txt);
        return jsonResponse(500, { error: "Gemini API error", detail: txt });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return jsonResponse(200, { response: text });
}

async function handleTitleRequest(prompt) {
    // Instrução específica e otimizada para a IA criar um título
    const titlePrompt = `Crie um título curto e conciso (máximo de 5 palavras) para a seguinte pergunta do usuário. Responda APENAS com o título, sem nenhuma formatação, aspas ou texto introdutório.\n\nPergunta: "${prompt}"`;

    const payload = { contents: [{ parts: [{ text: titlePrompt }] }] };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEN_API_KEY },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const txt = await res.text();
        console.error("Gemini Title API non-200:", res.status, txt);
        return jsonResponse(500, { error: "Gemini API error for title", detail: txt });
    }

    const data = await res.json();
    let title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Nova Conversa";
    // Limpeza extra para remover aspas ou outros caracteres que a IA possa adicionar
    title = title.replace(/^"|"$/g, '').replace(/\.$/, '');

    return jsonResponse(200, { title });
}

// --- ✅ HANDLER PRINCIPAL AGORA ATUA COMO UM ROTEADOR INTELIGENTE ---
exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "OPTIONS,POST,GET" } };
    }

    try {
        const body = event.body ? JSON.parse(event.body) : {};
        const prompt = body.prompt || "";
        const history = body.history || []; // Se 'history' não existir, será um array vazio.

        if (!prompt) {
            return jsonResponse(400, { error: "Missing 'prompt' in request body" });
        }

        // Roteia a requisição com base na presença do campo 'history'
        // Se o histórico estiver presente e não for vazio, é uma continuação de chat.
        if (history.length > 0) {
            return await handleChatRequest(prompt, history);
        } else {
            // Se não houver histórico, é a primeira mensagem, então geramos um título.
            return await handleTitleRequest(prompt);
        }

    } catch (err) {
        console.error("handler error:", err);
        return jsonResponse(500, { error: err.message || String(err) });
    }
};
