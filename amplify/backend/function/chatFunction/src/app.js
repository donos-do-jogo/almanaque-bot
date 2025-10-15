const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// --- Configuração do DynamoDB ---
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.STORAGE_CHATDB_NAME;

// --- Configuração do Express ---
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// --- Middleware de CORS ---
// Este bloco único deve ser a primeira coisa após a configuração inicial.
// Ele lida com as requisições "preflight" (OPTIONS) e adiciona os cabeçalhos corretos a todas as respostas.
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); // Permite qualquer origem (em produção, você pode restringir a URL do seu site)
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Headers', 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

	// Se o método da requisição for OPTIONS, o navegador está apenas checando as permissões de CORS.
	// Responda com 200 OK e encerre a requisição aqui.
	if (req.method === 'OPTIONS') {
		console.log("I run");
		return res.sendStatus(200);
	} else {
		console.log(res);
	}

	// Se não for uma requisição OPTIONS, continue para as rotas da sua API.
	next();
});

// --- Função Auxiliar para Obter o ID do Usuário ---
const getUserId = (req) => {
	try {
		//return req.apiGateway.event.requestContext.authorizer.claims.sub;
		return req.apiGateway.event.requestContext.identity.cognitoIdentityId;
		return req.apiGateway.event.requestContext.identity.cognitoIdentityId;
	} catch (error) {
		console.error("Não foi possível obter o ID do usuário. O token pode estar ausente ou inválido.", error);
		return null;
	}
};

/* ========================================
 * ROTAS DA API
 * ======================================== */

// GET /chats -> Lista todos os chats do usuário autenticado
app.get('/chats', async (req, res) => {
	const userId = getUserId(req);
	if (!userId) return res.status(401).json({ error: 'Usuário não autorizado' });

	const params = {
		TableName: tableName,
		KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
		ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'CHAT#' }
	};

	try {
		const data = await docClient.send(new QueryCommand(params));
		res.json(data.Items);
	} catch (err) {
		console.error("Erro ao buscar chats:", err);
		res.status(500).json({ error: 'Não foi possível buscar os chats' });
	}
});

// Outras rotas (POST /chats, GET /chats/:chatId/messages, etc.) continuam aqui...
app.post('/chats', async (req, res) => {
	const { v4: uuidv4 } = await import('uuid'); // Use dynamic import here
	const userId = getUserId(req);
	if (!userId) return res.status(401).json({ error: 'Usuário não autorizado' });
	const chatId = uuidv4();
	const { title } = req.body;
	const item = {
		PK: `USER#${userId}`,
		SK: `CHAT#${chatId}`,
		id: chatId,
		type: 'Chat',
		title: title || 'Nova Conversa',
		createdAt: new Date().toISOString(),
	};
	try {
		await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
		res.status(201).json(item);
	} catch (err) {
		console.error("Erro ao criar chat:", err);
		res.status(500).json({ error: 'Não foi possível criar o chat' });
	}
});

app.get('/chats/:chatId/messages', async (req, res) => {
	const { chatId } = req.params;
	const params = {
		TableName: tableName,
		KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
		ExpressionAttributeValues: { ':pk': `CHAT#${chatId}`, ':sk': 'MESSAGE#' }
	};
	try {
		const data = await docClient.send(new QueryCommand(params));
		res.json(data.Items);
	} catch (err) {
		console.error("Erro ao buscar mensagens:", err);
		res.status(500).json({ error: 'Não foi possível buscar as mensagens' });
	}
});

app.post('/chats/:chatId/messages', async (req, res) => {
	const { chatId } = req.params;
	const { content, role } = req.body;
	const item = {
		PK: `CHAT#${chatId}`,
		SK: `MESSAGE#${new Date().toISOString()}`,
		type: 'Message',
		content,
		role,
		createdAt: new Date().toISOString(),
	};
	try {
		await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
		res.status(201).json(item);
	} catch (err) {
		console.error("Erro ao salvar mensagem:", err);
		res.status(500).json({ error: 'Não foi possível salvar a mensagem' });
	}
});


// Exporta o app para o aws-serverless-express
module.exports = app;
