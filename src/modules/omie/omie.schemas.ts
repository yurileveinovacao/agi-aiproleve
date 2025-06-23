import { z } from 'zod';

// Schema para credenciais
export const omieCredentialsSchema = z.object({
  appKey: z.string().min(1, 'App Key é obrigatório'),
  appSecret: z.string().min(1, 'App Secret é obrigatório'),
  baseUrl: z.string().url().optional().default('https://app.omie.com.br/api/v1/'),
});

// Schemas base
export const paginacaoSchema = z.object({
  pagina: z.number().min(1).default(1),
  registros_por_pagina: z.number().min(1).max(500).default(50),
});

// CONTAS A PAGAR
export const contaPagarSchema = z.object({
  codigo_conta_pagar: z.string().optional(),
  codigo_fornecedor: z.number().positive('Código do fornecedor é obrigatório'),
  codigo_categoria: z.string().optional(),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  data_emissao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_previsao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  valor_documento: z.number().positive('Valor deve ser maior que zero'),
  numero_documento: z.string().optional(),
  numero_parcela: z.string().optional(),
  observacao: z.string().max(500).optional(),
  codigo_barras: z.string().optional(),
  status: z.enum(['ABERTO', 'PAGO', 'CANCELADO']).optional(),
  bloqueado: z.enum(['N', 'S']).optional(),
  info_documento: z.object({
    numero_documento_original: z.string().optional(),
    observacoes: z.string().optional(),
  }).optional(),
});

export const contaPagarPagamentoSchema = z.object({
  codigo_conta_pagar: z.string().min(1, 'Código da conta é obrigatório'),
  data_pagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valor_pagamento: z.number().positive(),
  codigo_conta_corrente: z.number().optional(),
  observacao: z.string().max(500).optional(),
  juros: z.number().min(0).optional(),
  multa: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
});

export const filtroContasPagarSchema = z.object({
  data_de: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_ate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['ABERTO', 'PAGO', 'CANCELADO']).optional(),
  codigo_fornecedor: z.number().optional(),
  codigo_categoria: z.string().optional(),
  apenas_importado_api: z.enum(['N', 'S']).optional(),
});

// CONTAS A RECEBER
export const contaReceberSchema = z.object({
  codigo_conta_receber: z.string().optional(),
  codigo_cliente: z.number().positive('Código do cliente é obrigatório'),
  codigo_categoria: z.string().optional(),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  data_emissao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_previsao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  valor_documento: z.number().positive(),
  numero_documento: z.string().optional(),
  numero_parcela: z.string().optional(),
  observacao: z.string().max(500).optional(),
  status: z.enum(['ABERTO', 'RECEBIDO', 'CANCELADO']).optional(),
  bloqueado: z.enum(['N', 'S']).optional(),
  info_documento: z.object({
    numero_documento_original: z.string().optional(),
    observacoes: z.string().optional(),
  }).optional(),
});

export const contaReceberRecebimentoSchema = z.object({
  codigo_conta_receber: z.string().min(1),
  data_recebimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valor_recebimento: z.number().positive(),
  codigo_conta_corrente: z.number().optional(),
  observacao: z.string().max(500).optional(),
  juros: z.number().min(0).optional(),
  multa: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
});

export const filtroContasReceberSchema = z.object({
  data_de: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_ate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['ABERTO', 'RECEBIDO', 'CANCELADO']).optional(),
  codigo_cliente: z.number().optional(),
  codigo_categoria: z.string().optional(),
  apenas_importado_api: z.enum(['N', 'S']).optional(),
});

// MOVIMENTAÇÃO FINANCEIRA
export const movimentacaoFinanceiraSchema = z.object({
  codigo_movimentacao: z.number().optional(),
  codigo_conta_corrente: z.number().positive(),
  data_movimentacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valor: z.number().positive(),
  tipo_operacao: z.enum(['ENTRADA', 'SAIDA']),
  historico: z.string().min(1, 'Histórico é obrigatório'),
  codigo_categoria: z.string().optional(),
  numero_documento: z.string().optional(),
  observacao: z.string().max(500).optional(),
});

// COMPRAS
export const pedidoCompraItemSchema = z.object({
  codigo_produto: z.string().min(1, 'Código do produto é obrigatório'),
  descricao: z.string().optional(),
  quantidade: z.number().positive('Quantidade deve ser maior que zero'),
  valor_unitario: z.number().positive('Valor unitário deve ser maior que zero'),
  valor_total: z.number().optional(),
  unidade: z.string().optional(),
  observacao: z.string().optional(),
});

export const pedidoCompraSchema = z.object({
  cabecalho: z.object({
    codigo_pedido: z.string().optional(),
    numero_pedido: z.string().optional(),
    codigo_fornecedor: z.number().positive('Código do fornecedor é obrigatório'),
    data_pedido: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    data_previsao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    observacoes: z.string().max(1000).optional(),
    status: z.enum(['DIGITACAO', 'APROVADO', 'FATURADO', 'CANCELADO']).optional(),
    codigo_empresa: z.number().optional(),
  }),
  det: z.array(pedidoCompraItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  informacoes_adicionais: z.object({
    codigo_conta_corrente: z.number().optional(),
    codigo_categoria: z.string().optional(),
    observacoes_internas: z.string().optional(),
  }).optional(),
});

export const filtroPedidosCompraSchema = z.object({
  data_de: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_ate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['DIGITACAO', 'APROVADO', 'FATURADO', 'CANCELADO']).optional(),
  codigo_fornecedor: z.number().optional(),
  apenas_importado_api: z.enum(['N', 'S']).optional(),
});

// COTAÇÕES
export const cotacaoFornecedorSchema = z.object({
  codigo_fornecedor: z.number().positive(),
  razao_social: z.string().optional(),
  data_resposta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  observacoes: z.string().optional(),
});

export const cotacaoItemSchema = z.object({
  codigo_produto: z.string().min(1),
  descricao: z.string().optional(),
  quantidade: z.number().positive(),
  unidade: z.string().optional(),
  cotacoes_fornecedor: z.array(z.object({
    codigo_fornecedor: z.number().positive(),
    valor_unitario: z.number().positive().optional(),
    prazo_entrega: z.number().min(0).optional(),
    observacoes: z.string().optional(),
  })),
});

export const cotacaoSchema = z.object({
  cabecalho: z.object({
    codigo_cotacao: z.string().optional(),
    numero_cotacao: z.string().optional(),
    data_cotacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    data_validade: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    observacoes: z.string().optional(),
    status: z.enum(['ATIVA', 'EXPIRADA', 'CANCELADA']).optional(),
  }),
  fornecedores: z.array(cotacaoFornecedorSchema).min(1),
  itens: z.array(cotacaoItemSchema).min(1),
});

// SCHEMAS PARA LISTAGENS COM PAGINAÇÃO
export const listarContasPagarInputSchema = paginacaoSchema.extend({
  filtros: filtroContasPagarSchema.optional(),
});

export const listarContasReceberInputSchema = paginacaoSchema.extend({
  filtros: filtroContasReceberSchema.optional(),
});

export const listarPedidosCompraInputSchema = paginacaoSchema.extend({
  filtros: filtroPedidosCompraSchema.optional(),
});

export const listarMovimentacoesInputSchema = paginacaoSchema.extend({
  codigo_conta_corrente: z.number().positive().optional(),
  data_de: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_ate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// SCHEMAS PARA CONSULTAS ESPECÍFICAS
export const consultarContaPagarInputSchema = z.object({
  codigo_conta_pagar: z.string().min(1, 'Código da conta é obrigatório'),
});

export const consultarContaReceberInputSchema = z.object({
  codigo_conta_receber: z.string().min(1, 'Código da conta é obrigatório'),
});

export const consultarPedidoCompraInputSchema = z.object({
  codigo_pedido: z.string().min(1, 'Código do pedido é obrigatório'),
});

export const consultarSaldoContaCorrenteInputSchema = z.object({
  codigo_conta_corrente: z.number().positive('Código da conta é obrigatório'),
  data_saldo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// VALIDAÇÃO DE DATAS
export const validateDateRange = (data_de?: string, data_ate?: string) => {
  if (data_de && data_ate) {
    const dateFrom = new Date(data_de);
    const dateTo = new Date(data_ate);
    if (dateFrom > dateTo) {
      throw new Error('Data inicial deve ser menor que data final');
    }
  }
};

// HELPER PARA VALIDAR CNPJ/CPF
export const cnpjCpfSchema = z.string().refine((value) => {
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  // Valida se é CPF (11 dígitos) ou CNPJ (14 dígitos)
  return numbers.length === 11 || numbers.length === 14;
}, 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');

// SCHEMAS DE RESPOSTA
export const omieResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    faultstring: z.string().optional(),
    faultcode: z.string().optional(),
    total_de_registros: z.number().optional(),
    total_de_paginas: z.number().optional(),
    registros_por_pagina: z.number().optional(),
    pagina_atual: z.number().optional(),
    resultado: dataSchema.optional(),
  });