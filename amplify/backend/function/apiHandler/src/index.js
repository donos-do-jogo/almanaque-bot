const AWS = require('aws-sdk'); // 1. Import the AWS SDK for SSM access
const SSM = new AWS.SSM();

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const persona = process.env.SYSTEM_PROMPT;

// Cache the secret value after the first fetch to avoid repeated SSM calls
let cachedApiKey;

async function getAnalystApiKey() {
    if (cachedApiKey) {
        return cachedApiKey;
    }

    const ssmParameterName = process.env.AI_ANALYST_API_KEY

    if (!ssmParameterName) {
        // Log a specific error to help with troubleshooting
        console.error("SSM_PARAM_NAME is missing. Ensure the secret is configured via 'amplify update function' (see instructions).");
        throw new Error("Configuration Error: Gemini API Key secret path not set.");
    }

    try {
        const result = await SSM.getParameter({
            Name: ssmParameterName,
            WithDecryption: true, // Crucial for SecureString
        }).promise();

        if (!result.Parameter || !result.Parameter.Value) {
            throw new Error(`SSM Parameter ${ssmParameterName} not found or value is empty.`);
        }

        cachedApiKey = result.Parameter.Value;
        return cachedApiKey;

    } catch (error) {
        console.error("Error fetching secret from SSM:", error);
        throw new Error("Failed to retrieve Gemini API Key from Secrets Manager.");
    }
}

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

async function handleChatRequest(prompt, history) {
    if (!persona) throw new Error("SYSTEM_PROMPT env variable is not set");

    // --- REFACTOR: FETCH API KEY SECURELY ---
    const apiKey = await getAnalystApiKey();

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
        // 2. Use the fetched API key
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
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

    const apiKey = await getAnalystApiKey();

    const payload = { contents: [{ parts: [{ text: titlePrompt }] }] };

    const res = await fetch(API_URL, {
        method: "POST",
        // 3. Use the fetched API key
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
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
        // Provide a clearer message if the secret retrieval failed
        if (err.message.includes("Failed to retrieve Gemini API Key")) {
            return jsonResponse(500, { error: "Configuration Error: Gemini API Key secret is not configured correctly." });
        }
        return jsonResponse(500, { error: err.message || String(err) });
    }
};


