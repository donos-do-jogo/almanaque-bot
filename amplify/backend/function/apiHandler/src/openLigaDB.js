const BASE_URL = "https://api.openligadb.de";

/**
 * Lida com a chamada fetch e tratamento de erro básico.
 * @param {string} path - O caminho do endpoint (ex: "/getbltable/bl1/2024")
 * @param {number} [sliceEnd] - Opcional. Limita o número de itens no array de resposta.
 * @returns {Promise<string>} Uma string JSON com os dados ou um erro.
 */
async function callApi(path, sliceEnd = null) {
    try {
        const url = `${BASE_URL}${path}`;
        console.log(`Chamando OpenLigaDB: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na API OpenLigaDB: ${response.statusText} (URL: ${url})`);
        }

        let data = await response.json();

        // Se for um array e sliceEnd foi fornecido, fatia o array.
        if (Array.isArray(data) && sliceEnd !== null) {
            data = data.slice(0, sliceEnd);
        }

        return JSON.stringify(data);

    } catch (error) {
        console.error(`Erro ao chamar ${path}:`, error);
        return JSON.stringify({ error: error.message });
    }
}

/**
 * FERRAMENTA 1: Busca a tabela de classificação (ranking)
 */
async function getLeagueTable(leagueShortcut, leagueSeason) {
    if (!leagueShortcut || !leagueSeason) {
        return JSON.stringify({ error: "leagueShortcut e leagueSeason são obrigatórios." });
    }
    // Retorna a tabela inteira.
    return callApi(`/getbltable/${leagueShortcut}/${leagueSeason}`);
}

/**
 * FERRAMENTA 2: Busca os artilheiros (top goal scorers)
 */
async function getTopGoalScorers(leagueShortcut, leagueSeason) {
    if (!leagueShortcut || !leagueSeason) {
        return JSON.stringify({ error: "leagueShortcut e leagueSeason são obrigatórios." });
    }
    // Retorna apenas os 10 primeiros artilheiros para economizar tokens
    return callApi(`/getgoalgetters/${leagueShortcut}/${leagueSeason}`, 10);
}

/**
 * FERRAMENTA 3: Busca a próxima partida de uma liga
 */
async function getNextMatch(leagueShortcut) {
    if (!leagueShortcut) {
        return JSON.stringify({ error: "leagueShortcut é obrigatório." });
    }
    return callApi(`/getnextmatchbyleagueshortcut/${leagueShortcut}`);
}

/**
 * FERRAMENTA 4: Busca os jogos de uma temporada inteira
 */
async function getMatchDataBySeason(leagueShortcut, leagueSeason) {
    if (!leagueShortcut || !leagueSeason) {
        return JSON.stringify({ error: "leagueShortcut e leagueSeason são obrigatórios." });
    }
    // Retorna apenas os 20 primeiros jogos para economizar tokens
    return callApi(`/getmatchdata/${leagueShortcut}/${leagueSeason}`, 20);
}

const toolSpec = {
    "functionDeclarations": [
        {
            "name": "getLeagueTable",
            "description": "Busca a tabela de classificação (ranking de times, pontos, vitórias, etc.) de uma liga para uma temporada específica.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "leagueShortcut": {
                        "type": "STRING",
                        "description": "A sigla da liga. Ex: 'bl1' (Bundesliga), 'pl' (Premier League)."
                    },
                    "leagueSeason": {
                        "type": "STRING",
                        "description": "O ano de início da temporada. Ex: '2024' para a temporada 2024/2025."
                    }
                },
                "required": ["leagueShortcut", "leagueSeason"]
            }
        },
        {
            "name": "getTopGoalScorers",
            "description": "Busca a lista dos artilheiros (jogadores com mais gols) de uma liga e temporada.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "leagueShortcut": {
                        "type": "STRING",
                        "description": "A sigla da liga. Ex: 'bl1' (Bundesliga), 'pl' (Premier League)."
                    },
                    "leagueSeason": {
                        "type": "STRING",
                        "description": "O ano de início da temporada. Ex: '2024' para a temporada 2024/2025."
                    }
                },
                "required": ["leagueShortcut", "leagueSeason"]
            }
        },
        {
            "name": "getNextMatch",
            "description": "Busca o próximo jogo agendado para uma liga específica.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "leagueShortcut": {
                        "type": "STRING",
                        "description": "A sigla da liga para buscar a próxima partida. Ex: 'bl1'."
                    }
                },
                "required": ["leagueShortcut"]
            }
        },
        {
            "name": "getMatchDataBySeason",
            "description": "Busca a lista de todos os jogos de uma temporada inteira de uma liga.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "leagueShortcut": {
                        "type": "STRING",
                        "description": "A sigla da liga. Ex: 'bl1'."
                    },
                    "leagueSeason": {
                        "type": "STRING",
                        "description": "O ano de início da temporada. Ex: '2024'."
                    }
                },
                "required": ["leagueShortcut", "leagueSeason"]
            }
        }
    ]
};

// Exportamos tudo que o index.js precisa
module.exports = {
    toolSpec,
    getLeagueTable,
    getTopGoalScorers,
    getNextMatch,
    getMatchDataBySeason
};
