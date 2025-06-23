# Integração Omie ERP com big-AGI

Esta integração permite conectar o big-AGI com a API do Omie ERP para executar tarefas relacionadas a:
- Contas a Pagar
- Contas a Receber  
- Saldo de Conta Corrente
- Setor de Compras completo

## 🚀 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# Omie ERP
OMIE_APP_KEY=sua_app_key_aqui
OMIE_APP_SECRET=seu_app_secret_aqui
```

Para obter essas credenciais:
1. Acesse o painel do Omie
2. Vá em **Configurações** → **Usuários e Permissões** → **API**
3. Crie uma nova aplicação e copie as credenciais

### 2. Teste de Conexão

Após configurar as credenciais, teste a conexão:

```typescript
import { useOmieConexao } from '~/modules/omie/hooks/useOmieApi';

function TestConnection() {
  const { data, isLoading } = useOmieConexao();
  
  return (
    <div>
      {isLoading ? 'Testando...' : data?.conectado ? 'Conectado!' : 'Erro na conexão'}
    </div>
  );
}
```

## 📊 Funcionalidades Disponíveis

### Contas a Pagar

```typescript
// Listar contas a pagar
const { data } = useContasPagar(1, 50, {
  status: 'ABERTO',
  data_de: '2024-01-01',
  data_ate: '2024-12-31'
});

// Criar nova conta a pagar
const mutation = useCriarContaPagar();
mutation.mutate({
  codigo_fornecedor: 123,
  valor_documento: 1500.00,
  data_vencimento: '2024-02-15',
  numero_documento: 'NF-001',
  observacao: 'Pagamento de fornecedor'
});

// Efetuar pagamento
const pagamento = usePagarContaPagar();
pagamento.mutate({
  codigo_conta_pagar: 'conta123',
  data_pagamento: '2024-01-15',
  valor_pagamento: 1500.00
});
```

### Contas a Receber

```typescript
// Listar contas a receber
const { data } = useContasReceber(1, 50, {
  status: 'ABERTO'
});

// Criar nova conta a receber
const mutation = useCriarContaReceber();
mutation.mutate({
  codigo_cliente: 456,
  valor_documento: 2500.00,
  data_vencimento: '2024-03-01',
  numero_documento: 'NF-002'
});

// Registrar recebimento
const recebimento = useReceberContaReceber();
recebimento.mutate({
  codigo_conta_receber: 'conta456',
  data_recebimento: '2024-03-01',
  valor_recebimento: 2500.00
});
```

### Compras

```typescript
// Listar pedidos de compra
const { data } = usePedidosCompra(1, 50, {
  status: 'APROVADO'
});

// Criar pedido de compra
const mutation = useCriarPedidoCompra();
mutation.mutate({
  cabecalho: {
    codigo_fornecedor: 123,
    data_pedido: '2024-01-15',
    observacoes: 'Pedido urgente'
  },
  det: [{
    codigo_produto: 'PROD001',
    quantidade: 10,
    valor_unitario: 150.00
  }]
});

// Faturar pedido
const faturamento = useFaturarPedidoCompra();
faturamento.mutate({
  codigo_pedido: 'PED001',
  dados_faturamento: {}
});
```

### Movimentação Financeira

```typescript
// Consultar saldo
const { data } = useSaldoContaCorrente(1, '2024-01-15');

// Listar movimentações
const { data } = useMovimentacoes(1, 1, 50, '2024-01-01', '2024-01-31');

// Listar contas correntes
const { data } = useContasCorrentes();
```

## 🤖 Comandos de IA Suportados

A integração permite comandos em linguagem natural como:

### Consultas
- "Mostre as contas a pagar vencidas até hoje"
- "Qual o saldo atual da conta principal?"
- "Liste os pedidos de compra pendentes"
- "Quais clientes têm contas em atraso?"

### Criação
- "Crie uma conta a receber para o cliente João no valor de R$ 5.000"
- "Registre um novo pedido de compra para o fornecedor ABC"
- "Lance uma movimentação de entrada de R$ 1.000"

### Relatórios
- "Gere um resumo financeiro do último mês"
- "Mostre o fluxo de caixa dos próximos 30 dias"
- "Compare as vendas deste mês com o anterior"

## 📱 Interface do Usuário

Use o componente `AppOmie` para uma interface completa:

```typescript
import { AppOmie } from '~/apps/omie/AppOmie';

function MyApp() {
  return <AppOmie onClose={() => console.log('Fechado')} />;
}
```

## 🔧 API Endpoints

### tRPC Routes Disponíveis

```typescript
// Conexão
trpc.omie.testarConexao.query()

// Contas a Pagar
trpc.omie.criarContaPagar.mutate(data)
trpc.omie.listarContasPagar.query(params)
trpc.omie.consultarContaPagar.query({ codigo_conta_pagar })
trpc.omie.pagarContaPagar.mutate(data)

// Contas a Receber
trpc.omie.criarContaReceber.mutate(data)
trpc.omie.listarContasReceber.query(params)
trpc.omie.receberContaReceber.mutate(data)

// Compras
trpc.omie.criarPedidoCompra.mutate(data)
trpc.omie.listarPedidosCompra.query(params)
trpc.omie.faturarPedidoCompra.mutate(data)

// Financeiro
trpc.omie.consultarSaldoContaCorrente.query({ codigo_conta_corrente })
trpc.omie.listarMovimentacoes.query(params)
trpc.omie.obterResumoFinanceiro.query({ data_de, data_ate })

// Cadastros
trpc.omie.listarClientes.query(params)
trpc.omie.listarFornecedores.query(params)
trpc.omie.listarProdutos.query(params)
```

## 🛡️ Tratamento de Erros

A integração trata automaticamente:

- **Erros de Conexão**: Timeout, rede indisponível
- **Erros da API Omie**: Códigos de erro específicos do Omie
- **Validação**: Dados inválidos são rejeitados antes do envio
- **Rate Limiting**: Controle automático de frequência de requests

### Exemplo de Tratamento

```typescript
const mutation = useCriarContaPagar();

const handleCreate = async (data) => {
  try {
    await mutation.mutateAsync(data);
    toast.success('Conta criada com sucesso!');
  } catch (error) {
    if (error.message.includes('Omie API Error')) {
      toast.error(`Erro no Omie: ${error.message}`);
    } else {
      toast.error('Erro inesperado');
    }
  }
};
```

## 📈 Dashboards e Relatórios

### Resumo Financeiro

```typescript
const { data } = useResumoFinanceiro('2024-01-01', '2024-01-31');

// Retorna:
// {
//   contas_pagar: { total: 15000, quantidade: 5 },
//   contas_receber: { total: 25000, quantidade: 8 },
//   saldo_liquido: 10000
// }
```

### Métricas Personalizadas

Combine múltiplas queries para criar dashboards:

```typescript
function FinancialDashboard() {
  const contasPagar = useContasPagar(1, 100, { status: 'ABERTO' });
  const contasReceber = useContasReceber(1, 100, { status: 'ABERTO' });
  const saldo = useSaldoContaCorrente(1);
  
  const metrics = {
    totalPagar: contasPagar.data?.registros.reduce((acc, c) => acc + c.valor_documento, 0),
    totalReceber: contasReceber.data?.registros.reduce((acc, c) => acc + c.valor_documento, 0),
    saldoAtual: saldo.data?.saldo_atual
  };
  
  return <DashboardComponent metrics={metrics} />;
}
```

## 🔄 Sincronização

### Invalidação de Cache

```typescript
const { invalidateAll, invalidateContasPagar } = useInvalidateOmieQueries();

// Atualizar todos os dados
invalidateAll();

// Atualizar apenas contas a pagar
invalidateContasPagar();
```

### Auto-refresh

```typescript
// Query que atualiza a cada 30 segundos
const { data } = useSaldoContaCorrente(1, undefined, {
  refetchInterval: 30000
});
```

## 🚨 Limitações

- **Rate Limiting**: Omie tem limite de requests por minuto
- **Dados**: Apenas dados da empresa configurada nas credenciais
- **Permissões**: Dependem das permissões da API Key no Omie
- **Campos**: Nem todos os campos da API Omie estão implementados

## 📚 Referências

- [Documentação API Omie](https://developer.omie.com.br/)
- [Referência tRPC](https://trpc.io/)
- [React Query](https://tanstack.com/query/)

## 🤝 Contribuições

Para adicionar novos endpoints:

1. Adicione os types em `omie.types.ts`
2. Crie os schemas em `omie.schemas.ts`
3. Implemente no cliente em `omie.client.ts`
4. Adicione as routes tRPC em `omie.router.ts`
5. Crie os hooks React em `useOmieApi.ts`