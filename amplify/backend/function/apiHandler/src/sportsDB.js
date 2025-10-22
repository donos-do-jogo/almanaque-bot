// ARQUIVO: sportsDB.js

// A chave de API '1' é a chave de teste gratuita.
// Estamos usando uma variável de ambiente para que você possa substituí-la pela sua chave premium se tiver uma.
const API_KEY = process.env.SPORTSDB_API_KEY || '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

/**
 * Função auxiliar genérica para chamar a API TheSportsDB
 * @param {string} path - O caminho do endpoint (ex: "/searchteams.php")
 * @param {Object} queryParams - Um objeto de parâmetros de busca (ex: { t: 'Arsenal' })
 * @returns {Promise<string>} Uma string JSON com os dados ou um erro.
 */
async function callApi(path, queryParams = {}) {
    // Constrói a URL com os parâmetros de busca
    const url = new URL(`${BASE_URL}${path}`);
    Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));

    try {
        console.log(`Chamando TheSportsDB: ${url.toString()}`);
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Erro na API TheSportsDB: ${response.statusText} (URL: ${url.toString()})`);
        }

        const data = await response.json();

        // A API retorna { "teams": null } ou { "player": null } etc. se não encontrar nada.
        // Precisamos tratar isso como "não encontrado" para o Gemini.
        if (!data ||
            (data.teams === null) ||
            (data.player === null) ||
            (data.leagues === null) ||
            (data.events === null) ||
            (data.table === null)) {
            return JSON.stringify({ message: "Nenhum resultado encontrado." });
        }

        // Retorna os dados como uma string JSON
        return JSON.stringify(data);

    } catch (error) {
        console.error(`Erro ao chamar ${path}:`, error);
        return JSON.stringify({ error: error.message });
    }
}

// --- Funções da Ferramenta ---

/**
 * FERRAMENTA 1: Busca ligas por esporte e país.
 * Essencial para encontrar o 'idLeague' de uma liga (ex: Brasileirão).
 */
async function searchLeagueByName(sport, country) {
    if (!sport || !country) {
        return JSON.stringify({ error: "Esporte e país são obrigatórios." });
    }
    return callApi('/search_all_leagues.php', { s: sport, c: country });
}

/**
 * FERRAMENTA 2: Busca a tabela de classificação (ranking) de uma liga.
 * Usa o 'idLeague' da Ferramenta 1.
 */
async function getLeagueTable(leagueId, season) {
    if (!leagueId) {
        return JSON.stringify({ error: "leagueId é obrigatório." });
    }
    // O parâmetro 's' (season) é opcional.
    const params = { l: leagueId };
    if (season) {
        params.s = season;
    }
    return callApi('/lookuptable.php', params);
}

/**
 * FERRAMENTA 3: Busca um time pelo nome.
 * Essencial para encontrar o 'idTeam' de um time (ex: Flamengo).
 */
async function searchTeamByName(teamName) {
    if (!teamName) {
        return JSON.stringify({ error: "teamName é obrigatório." });
    }
    return callApi('/searchteams.php', { t: teamName });
}

/**
 * FERRAMENTA 4: Busca os próximos jogos de um time.
 * Usa o 'idTeam' da Ferramenta 3.
 */
async function getNextTeamEvents(teamId) {
    if (!teamId) {
        return JSON.stringify({ error: "teamId é obrigatório." });
    }
    return callApi('/eventsnext.php', { id: teamId });
}

/**
 * FERRAMENTA 5: Busca os últimos resultados de um time.
 * Usa o 'idTeam' da Ferramenta 3.
 */
async function getPastTeamEvents(teamId) {
    if (!teamId) {
        return JSON.stringify({ error: "teamId é obrigatório." });
    }
    return callApi('/eventslast.php', { id: teamId });
}

/**
 * FERRAMENTA 6: Busca um jogador pelo nome.
 * Essencial para encontrar o 'idPlayer'.
 */
async function searchPlayerByName(playerName) {
    if (!playerName) {
        return JSON.stringify({ error: "playerName é obrigatório." });
    }
    return callApi('/searchplayers.php', { p: playerName });
}

/**
 * FERRAMENTA 7: Busca jogos por dia.
 * Útil para "Quais os jogos de hoje?".
 */
async function getEventsByDay(date, sport) {
    if (!date) {
        return JSON.stringify({ error: "Data (date) é obrigatória (formato AAAA-MM-DD)." });
    }
    // O parâmetro 's' (sport) é opcional.
    const params = { d: date };
    if (sport) {
        params.s = sport;
    }
    return callApi('/eventsday.php', params);
}


// --- Definição das Ferramentas para o Gemini ---

// Descrevemos cada função para que o Gemini saiba como e quando usá-las.
const toolSpec = {
    "functionDeclarations": [
        {
            "name": "searchLeagueByName",
            "description": "Busca ligas por nome do esporte e país. Retorna detalhes da liga, incluindo o ID da liga (idLeague), que é necessário para outras funções.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "sport": {
                        "type": "STRING",
                        "description": "O nome do esporte (ex: 'Soccer', 'Basketball')."
                    },
                    "country": {
                        "type": "STRING",
                        "description": "O nome do país (ex: 'Brazil', 'England')."
                    }
                },
                "required": ["sport", "country"]
            }
        },
        {
            "name": "getLeagueTable",
            "description": "Busca a tabela de classificação (ranking de times, pontos) de uma liga. Requer o ID da liga. Opcionalmente, pode filtrar por temporada.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "leagueId": {
                        "type": "STRING",
                        "description": "O ID da liga (obtido de searchLeagueByName). Ex: '4328' para English Premier League."
                    },
                    "season": {
                        "type": "STRING",
                        "description": "Opcional. A temporada (ex: '2024-2025'). Se omitido, usa a temporada atual."
                    }
                },
                "required": ["leagueId"]
            }
        },
        {
            "name": "searchTeamByName",
            "description": "Busca os detalhes de um time pelo nome. Retorna detalhes do time, incluindo o ID do time (idTeam), que é necessário para outras funções.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "teamName": {
                        "type": "STRING",
                        "description": "O nome do time (ex: 'Arsenal', 'Flamengo')."
                    }
                },
                "required": ["teamName"]
            }
        },
        {
            "name": "getNextTeamEvents",
            "description": "Busca os próximos jogos agendados para um time específico. Requer o ID do time. NOTA: A chave de API gratuita pode mostrar apenas eventos em casa.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "teamId": {
                        "type": "STRING",
                        "description": "O ID do time (obtido de searchTeamByName)."
                    }
                },
                "required": ["teamId"]
            }
        },
        {
            "name": "getPastTeamEvents",
            "description": "Busca os últimos resultados (jogos passados) de um time específico. Requer o ID do time. NOTA: A chave de API gratuita pode mostrar apenas eventos em casa.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "teamId": {
                        "type": "STRING",
                        "description": "O ID do time (obtido de searchTeamByName)."
                    }
                },
                "required": ["teamId"]
            }
        },
        {
            "name": "searchPlayerByName",
            "description": "Busca os detalhes de um jogador pelo nome. Retorna detalhes do jogador, incluindo o ID do jogador (idPlayer).",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "playerName": {
                        "type": "STRING",
                        "description": "O nome do jogador (ex: 'Neymar', 'Bukayo Saka')."
                    }
                },
                "required": ["playerName"]
            }
        },
        {
            "name": "getEventsByDay",
            "description": "Busca todos os eventos (jogos) de um dia específico. Opcionalmente, pode filtrar por esporte.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "date": {
                        "type": "STRING",
                        "description": "A data no formato AAAA-MM-DD (ex: '2025-10-22')."
                    },
                    "sport": {
                        "type": "STRING",
                        "description": "Opcional. O nome do esporte para filtrar (ex: 'Soccer')."
                    }
                },
                "required": ["date"]
            }
        }
    ]
};

// Exportamos tudo que o index.js precisa
module.exports = {
    toolSpec,
    searchLeagueByName,
    getLeagueTable,
    searchTeamByName,
    getNextTeamEvents,
    getPastTeamEvents,
    searchPlayerByName,
    getEventsByDay
};
