/* const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
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

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ message: 'CORS preflight check successful' })
        };
    }

    try {
        if (!persona) {
            throw new Error("SYSTEM_PROMPT env variable is not set");
        }

        const systemInstruction = {
            role: 'user',
            parts: [{ text: persona }]
        };

        const body = event.body ? JSON.parse(event.body) : {};
        const prompt = body.prompt || "";
        const history = body.history || [];

        if (!prompt)
            return jsonResponse(400, { error: "Missing 'prompt' in request body" });

        // Construct the conversation history for the Gemini API
        const contents = [
            ...history.map(h => ({
                role: h.isBot ? "model" : "user",
                parts: [{ text: h.text }]
            })),
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ];

        const payload = {
            systemInstruction,
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192, // Increased token limit
            },
        };

        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEN_API_KEY,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error("Gemini API non-200:", res.status, txt);
            return jsonResponse(500, { error: "Gemini API error", detail: txt });
        }

        const data = await res.json();

        let text = "";
        if (Array.isArray(data.candidates) && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            const parts = candidate.content?.parts;
            if (Array.isArray(parts)) {
                text = parts.map((p) => p.text || "").join("");
            }
        }

        if (!text && data.candidates[0].finishReason !== 'MAX_TOKENS') {
            text = JSON.stringify(data, null, 2);
        } else if (!text && data.candidates[0].finishReason === 'MAX_TOKENS') {
            text = "I have more to say, but I've reached my current limit!";
        }

        return jsonResponse(200, { response: text, meta: { model: MODEL } });
    } catch (err) {
        console.error("handler error:", err);
        return jsonResponse(500, { error: err.message || String(err) });
    }
}; */

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
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

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ message: 'CORS preflight check successful' })
        };
    }

    try {
        if (!persona) {
            throw new Error("SYSTEM_PROMPT env variable is not set");
        }

        const systemInstruction = {
            role: 'user',
            parts: [{ text: persona }]
        };

        const body = event.body ? JSON.parse(event.body) : {};
        const prompt = body.prompt || "";
        const history = body.history || [];

        if (!prompt)
            return jsonResponse(400, { error: "Missing 'prompt' in request body" });

        // Construct the conversation history for the Gemini API
        const contents = [
            // --- CORRECTION START ---
            // This now correctly translates the history from your frontend's format
            // to the format the Gemini API expects.
            ...history.map(h => ({
                // 1. Use h.role and translate 'assistant' to 'model' for the API
                role: h.role === 'assistant' ? "model" : "user",
                // 2. Use h.content for the message text
                parts: [{ text: h.content }]
            })),
            // --- CORRECTION END ---
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ];

        const payload = {
            systemInstruction,
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
            },
        };

        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEN_API_KEY,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error("Gemini API non-200:", res.status, txt);
            return jsonResponse(500, { error: "Gemini API error", detail: txt });
        }

        const data = await res.json();

        let text = "";
        if (Array.isArray(data.candidates) && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            const parts = candidate.content?.parts;
            if (Array.isArray(parts)) {
                text = parts.map((p) => p.text || "").join("");
            }
        }

        if (!text && data.candidates[0].finishReason !== 'MAX_TOKENS') {
            text = JSON.stringify(data, null, 2);
        } else if (!text && data.candidates[0].finishReason === 'MAX_TOKENS') {
            text = "I have more to say, but I've reached my current limit!";
        }

        return jsonResponse(200, { response: text, meta: { model: MODEL } });
    } catch (err) {
        console.error("handler error:", err);
        return jsonResponse(500, { error: err.message || String(err) });
    }
};
