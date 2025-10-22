const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, BatchWriteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// --- Configuração do DynamoDB ---
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.STORAGE_CHATDB_NAME;

// --- Configuração do Express ---
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); // Permite qualquer origem (em produção, você pode restringir a URL do seu site)
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Headers', 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

	// Se o método da requisição for OPTIONS, o navegador está apenas checando as permissões de CORS.
	// Responda com 200 OK e encerre a requisição aqui.
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	} else {
		console.log(res);
	}

	next();
});

// --- Função Auxiliar para Obter o ID do Usuário ---
const getUserId = (req) => {
	try {
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
		const sortedItems = data.Items.sort((a, b) => {
			const dateA = new Date(a.updatedAt || a.createdAt);
			const dateB = new Date(b.updatedAt || b.createdAt);
			return dateB - dateA;
		});

		res.json(sortedItems);
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
	const userId = getUserId(req); // Precisamos do userId para atualizar o chat
	if (!userId) return res.status(401).json({ error: 'Usuário não autorizado' });

	const { chatId } = req.params;
	const { content, role } = req.body;
	const timestamp = new Date().toISOString();

	const messageItem = {
		PK: `CHAT#${chatId}`,
		SK: `MESSAGE#${timestamp}`,
		type: 'Message',
		content,
		role,
		createdAt: timestamp,
	};

	try {
		// ETAPA 1: Salva a nova mensagem como antes
		await docClient.send(new PutCommand({ TableName: tableName, Item: messageItem }));

		// --- ✅ ETAPA 2: ATUALIZA O ITEM DA CONVERSA "PAI" ---
		const updateChatParams = {
			TableName: tableName,
			Key: {
				PK: `USER#${userId}`,
				SK: `CHAT#${chatId}`
			},
			// Define o atributo 'updatedAt' com o carimbo de data/hora da nova mensagem
			UpdateExpression: "set #updatedAt = :timestamp",
			ExpressionAttributeNames: {
				"#updatedAt": "updatedAt"
			},
			ExpressionAttributeValues: {
				":timestamp": timestamp
			}
		};

		await docClient.send(new UpdateCommand(updateChatParams));

		res.status(201).json(messageItem);

	} catch (err) {
		console.error("Erro ao salvar mensagem e atualizar chat:", err);
		res.status(500).json({ error: 'Não foi possível salvar a mensagem' });
	}
});

// DELETE /chats/:chatId -> Exclui uma conversa e todas as suas mensagens
app.delete('/chats/:chatId', async (req, res) => {
	const userId = getUserId(req);
	if (!userId) return res.status(401).json({ error: 'Usuário não autorizado' });

	const { chatId } = req.params;
	if (!chatId) return res.status(400).json({ error: 'O ID do chat é obrigatório' });

	try {
		// ETAPA 1: Encontrar todas as mensagens da conversa
		const queryMessagesParams = {
			TableName: tableName,
			KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
			ExpressionAttributeValues: {
				':pk': `CHAT#${chatId}`,
				':sk': 'MESSAGE#'
			},
			// Apenas precisamos das chaves para deletar, não dos dados completos
			ProjectionExpression: 'PK, SK'
		};

		const messagesToDelete = await docClient.send(new QueryCommand(queryMessagesParams));

		// ETAPA 2: Deletar todas as mensagens em lote (se houver alguma)
		if (messagesToDelete.Items && messagesToDelete.Items.length > 0) {
			const deleteRequests = messagesToDelete.Items.map(item => ({
				DeleteRequest: {
					Key: { PK: item.PK, SK: item.SK }
				}
			}));

			// O DynamoDB permite deletar até 25 itens por chamada de lote
			const batchDeleteParams = {
				RequestItems: {
					[tableName]: deleteRequests
				}
			};
			await docClient.send(new BatchWriteCommand(batchDeleteParams));
			console.log(`Foram deletadas ${deleteRequests.length} mensagens para o chat ${chatId}.`);
		}

		// ETAPA 3: Deletar o item principal da conversa
		const deleteChatParams = {
			TableName: tableName,
			Key: {
				PK: `USER#${userId}`, // Garante que o usuário só pode deletar seus próprios chats
				SK: `CHAT#${chatId}`
			}
		};

		await docClient.send(new DeleteCommand(deleteChatParams));
		console.log(`A conversa ${chatId} foi deletada com sucesso.`);

		// Responde com 204 No Content, que é o padrão para uma exclusão bem-sucedida
		res.status(204).send();

	} catch (err) {
		console.error("Erro ao deletar a conversa:", err);
		res.status(500).json({ error: 'Não foi possível deletar a conversa' });
	}
});

// Exporta o app para o aws-serverless-express
module.exports = app;
