/* import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Amplify } from 'aws-amplify'; // Correct v6 import
import config from './amplifyconfiguration.json'; // The new config file name

// Configure Amplify
Amplify.configure(config);

createRoot(document.getElementById("root")!).render(<App />); */


/*import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';

// --- INÍCIO DA MODIFICAÇÃO ---

// 1. Encontra a configuração da sua API a partir do arquivo JSON
//    Vamos configurar ambas as APIs para garantir que todas as chamadas futuras funcionem.
const apiConfigs = {};
if (config.aws_cloud_logic_custom) {
  config.aws_cloud_logic_custom.forEach(api => {
    apiConfigs[api.name] = {
      endpoint: api.endpoint,
      region: api.region,
      // 2. Esta é a linha CRÍTICA: Diz ao Amplify para usar o token do usuário logado
      //    para autorizar as requisições a esta API.
      authorizationType: 'AMAZON_COGNITO_USER_POOLS',
    };
  });
}

// 3. Mescla a configuração de API que criamos com a configuração original do arquivo.
const finalConfig = {
  ...config,
  API: {
    REST: apiConfigs,
  },
};

// 4. Passa a configuração final e completa para o Amplify
Amplify.configure(finalConfig);

// --- FIM DA MODIFICAÇÃO ---


createRoot(document.getElementById("root")!).render(<App />); */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';

// --- INÍCIO DA VERSÃO CORRIGIDA E OTIMIZADA ---

// A biblioteca Amplify v6 espera que a configuração da API REST
// esteja sob a chave `API.REST`. O arquivo `amplifyconfiguration.json`
// gerado pelo CLI as coloca em `aws_cloud_logic_custom`.
// Este código transforma a configuração para o formato esperado.
const restApiConfig = config.aws_cloud_logic_custom.reduce((acc, api) => {
  acc[api.name] = {
    endpoint: api.endpoint,
    region: api.region,
    // CORREÇÃO: Usa a authorizationType do arquivo JSON apenas se ela existir.
    // Isso evita forçar a autenticação em APIs que deveriam ser públicas.
    ...(api.authorizationType && { authorizationType: api.authorizationType })
  };
  return acc;
}, {});

// Mescla a configuração da API transformada com a configuração original.
const finalConfig = {
  ...config,
  API: {
    ...config.API, // Preserva outras configurações de API (ex: GraphQL) se existirem
    REST: restApiConfig,
  },
};

// Passa a configuração final e completa para o Amplify.
Amplify.configure(finalConfig);

// --- FIM DA VERSÃO CORRIGIDA E OTIMIZADA ---

createRoot(document.getElementById("root")!).render(<App />);
