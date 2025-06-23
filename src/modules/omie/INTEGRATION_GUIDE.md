# 🔗 Guia de Integração Omie ERP para big-AGI

## Visão Geral

Esta integração completa permite ao big-AGI executar tarefas financeiras no ERP Omie através de comandos em linguagem natural. A integração inclui:

- **API Client Type-Safe**: Comunicação completa com API Omie
- **Comandos de IA**: Processamento de linguagem natural para tarefas ERP
- **Interface React**: Componentes prontos para uso
- **tRPC Integration**: Endpoints seguros e tipados
- **Hooks React Query**: Cache e estado otimizados

## 🚀 Configuração Rápida

### 1. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# Credenciais Omie ERP
OMIE_APP_KEY=seu_app_key_aqui
OMIE_APP_SECRET=seu_app_secret_aqui
```

### 2. Teste de Conexão

```typescript
import { useOmieConexao } from '~/modules/omie/hooks/useOmieApi';

function TestConnection() {
  const { data, isLoading, error } = useOmieConexao();
  
  if (isLoading) return <div>Conectando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return (
    <div>
      Status: {data?.conectado ? '✅ Conectado' : '❌ Desconectado'}
    </div>
  );
}
```

### 3. Usar Comandos de IA

```typescript
import { useOmieChat } from '~/modules/omie/hooks/useOmieAiCommands';

function ChatBot() {
  const { handleMessage, isProcessing } = useOmieChat();
  
  const processCommand = async (userInput: string) => {
    const response = await handleMessage(userInput);
    console.log('IA Response:', response);
  };
  
  return (
    <div>
      <button onClick={() => processCommand('Mostre contas vencidas')}>
        Testar Comando
      </button>
    </div>
  );
}
```

## 📋 Funcionalidades Implementadas

### Contas a Pagar
- ✅ Listar contas (com filtros)
- ✅ Criar nova conta
- ✅ Consultar detalhes
- ✅ Registrar pagamento
- ✅ Filtros avançados (data, status, fornecedor)

### Contas a Receber  
- ✅ Listar contas (com filtros)
- ✅ Criar nova conta
- ✅ Consultar detalhes
- ✅ Registrar recebimento
- ✅ Identificar contas vencidas

### Pedidos de Compra
- ✅ Listar pedidos
- ✅ Criar novo pedido
- ✅ Consultar detalhes
- ✅ Acompanhar status

### Relatórios Financeiros
- ✅ Resumo por período
- ✅ Análise de fluxo de caixa
- ✅ Contas vencidas
- ✅ Saldo de contas correntes

## 🤖 Comandos de IA Suportados

### Consultas
```
"Mostre as contas a pagar vencidas até hoje"
"Qual o saldo atual da conta principal?"
"Liste os pedidos de compra aprovados"
"Quais clientes estão em atraso?"
"Gere um relatório financeiro do último mês"
```

### Criação de Registros
```
"Crie uma conta a receber para o cliente João no valor de R$ 5.000"
"Registre um pagamento de R$ 1.500 para a conta 12345"
"Criar pedido de compra para fornecedor ABC"
```

### Análises
```
"Resumo financeiro desta semana"
"Clientes com maior valor em atraso" 
"Fornecedores com contas em aberto"
```

## 🛠️ Componentes Disponíveis

### AppOmie.tsx
Dashboard principal com resumo financeiro e tabelas de dados.

```typescript
import { AppOmie } from '~/apps/omie/AppOmie';

<AppOmie onClose={() => console.log('Fechado')} />
```

### OmieIntegrationExample.tsx
Interface de chat completa para demonstrar comandos de IA.

```typescript
import { OmieIntegrationExample } from '~/modules/omie/examples/OmieIntegrationExample';

<OmieIntegrationExample />
```

## 🔧 Hooks Disponíveis

### Dados Básicos
```typescript
// Conexão e status
const conexao = useOmieConexao();

// Contas a pagar
const contasPagar = useContasPagar(pagina, limite, filtros);

// Contas a receber  
const contasReceber = useContasReceber(pagina, limite, filtros);

// Pedidos de compra
const pedidos = usePedidosCompra(pagina, limite, filtros);
```

### Comandos de IA
```typescript
// Chat integrado
const { handleMessage, isProcessing } = useOmieChat();

// Comandos avançados
const aiCommands = useOmieAiCommands();
```

### Mutations (Criação/Edição)
```typescript
const { mutate: criarConta } = useIncluirContaPagar();
const { mutate: pagarConta } = usePagarContaPagar();
const { mutate: criarPedido } = useIncluirPedidoCompra();
```

## 🎯 Exemplos de Uso Prático

### 1. Dashboard Financeiro
```typescript
function FinancialDashboard() {
  const resumo = useResumoFinanceiro('2024-01-01', '2024-12-31');
  
  return (
    <div>
      <h2>Resumo Financeiro 2024</h2>
      {resumo.data && (
        <>
          <p>A Pagar: R$ {resumo.data.contas_pagar.total}</p>
          <p>A Receber: R$ {resumo.data.contas_receber.total}</p>
          <p>Saldo: R$ {resumo.data.saldo_liquido}</p>
        </>
      )}
    </div>
  );
}
```

### 2. Lista de Contas Vencidas
```typescript
function ContasVencidas() {
  const hoje = new Date().toISOString().split('T')[0];
  const contas = useContasPagar(1, 100, {
    status: 'ABERTO',
    data_ate: hoje
  });
  
  const vencidas = contas.data?.registros.filter(conta => 
    new Date(conta.data_vencimento) <= new Date(hoje)
  );
  
  return (
    <div>
      <h3>{vencidas?.length || 0} contas vencidas</h3>
      {vencidas?.map(conta => (
        <div key={conta.codigo_conta_pagar}>
          {conta.razao_social} - R$ {conta.valor_documento}
        </div>
      ))}
    </div>
  );
}
```

### 3. Chat com IA
```typescript
function OmieAiChat() {
  const [message, setMessage] = useState('');
  const { handleMessage, isProcessing } = useOmieChat();
  
  const sendMessage = async () => {
    const response = await handleMessage(message);
    alert(response);
    setMessage('');
  };
  
  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite um comando..."
      />
      <button onClick={sendMessage} disabled={isProcessing}>
        {isProcessing ? 'Processando...' : 'Enviar'}
      </button>
    </div>
  );
}
```

## 🔐 Segurança

- ✅ Credenciais nunca expostas no frontend
- ✅ Validação Zod em todas as entradas
- ✅ Error handling robusto
- ✅ Rate limiting considerado
- ✅ HTTPS obrigatório em produção

## 📊 Performance

- ✅ Cache inteligente com React Query
- ✅ Invalidação automática após mutations
- ✅ Paginação otimizada
- ✅ Loading states em todas as operações
- ✅ Error boundaries implementados

## 🚨 Troubleshooting

### Erro de Conexão
```
❌ Falha na conexão com Omie
```
**Solução**: Verificar OMIE_APP_KEY e OMIE_APP_SECRET

### Erro de Autorização
```
❌ faultcode: SOAP-ENV:Client-5001
```
**Solução**: Credenciais inválidas ou expiradas

### Timeout de Request
```
❌ Request timeout
```
**Solução**: Verificar conectividade ou aumentar timeout

## 🔄 Próximos Passos

1. **Adicionar mais endpoints**: NFe, produtos, clientes
2. **Dashboard avançado**: Gráficos e métricas
3. **Notificações**: Alertas de vencimento
4. **Relatórios**: PDF e Excel exports
5. **Sincronização**: Background jobs
6. **Mobile**: App React Native

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a [documentação oficial do Omie](https://developer.omie.com.br/)
2. Verifique os logs do console do navegador
3. Teste a conexão com `useOmieConexao()`

---

**🎉 Integração completa implementada!**

Esta integração transforma o big-AGI em um assistente inteligente capaz de automatizar tarefas financeiras complexas através de comandos simples em português.