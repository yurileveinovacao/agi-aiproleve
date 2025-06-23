// Types para integração com API do Omie
export interface OmieCredentials {
  appKey: string;
  appSecret: string;
  baseUrl?: string;
}

export interface OmieApiRequest {
  call: string;
  app_key: string;
  app_secret: string;
  param: any[];
}

export interface OmieApiResponse<T = any> {
  faultstring?: string;
  faultcode?: string;
  total_de_registros?: number;
  total_de_paginas?: number;
  registros_por_pagina?: number;
  pagina_atual?: number;
  resultado?: T;
}

// CONTAS A PAGAR
export interface ContaPagar {
  codigo_conta_pagar?: string;
  codigo_fornecedor: number;
  codigo_categoria?: string;
  data_vencimento: string; // YYYY-MM-DD
  data_emissao?: string;
  data_previsao?: string;
  valor_documento: number;
  numero_documento?: string;
  numero_parcela?: string;
  observacao?: string;
  codigo_barras?: string;
  status?: 'ABERTO' | 'PAGO' | 'CANCELADO';
  bloqueado?: 'N' | 'S';
  info_documento?: {
    numero_documento_original?: string;
    observacoes?: string;
  };
}

export interface ContaPagarPagamento {
  codigo_conta_pagar: string;
  data_pagamento: string;
  valor_pagamento: number;
  codigo_conta_corrente?: number;
  observacao?: string;
  juros?: number;
  multa?: number;
  desconto?: number;
}

// CONTAS A RECEBER
export interface ContaReceber {
  codigo_conta_receber?: string;
  codigo_cliente: number;
  codigo_categoria?: string;
  data_vencimento: string;
  data_emissao?: string;
  data_previsao?: string;
  valor_documento: number;
  numero_documento?: string;
  numero_parcela?: string;
  observacao?: string;
  status?: 'ABERTO' | 'RECEBIDO' | 'CANCELADO';
  bloqueado?: 'N' | 'S';
  info_documento?: {
    numero_documento_original?: string;
    observacoes?: string;
  };
}

export interface ContaReceberRecebimento {
  codigo_conta_receber: string;
  data_recebimento: string;
  valor_recebimento: number;
  codigo_conta_corrente?: number;
  observacao?: string;
  juros?: number;
  multa?: number;
  desconto?: number;
}

// CONTA CORRENTE
export interface ContaCorrente {
  codigo_conta_corrente: number;
  descricao: string;
  codigo_banco?: string;
  agencia?: string;
  numero_conta?: string;
  saldo_inicial?: number;
  data_saldo?: string;
  inativa?: 'N' | 'S';
}

export interface MovimentacaoFinanceira {
  codigo_movimentacao?: number;
  codigo_conta_corrente: number;
  data_movimentacao: string;
  valor: number;
  tipo_operacao: 'ENTRADA' | 'SAIDA';
  historico: string;
  codigo_categoria?: string;
  numero_documento?: string;
  observacao?: string;
}

// COMPRAS
export interface PedidoCompra {
  cabecalho: {
    codigo_pedido?: string;
    numero_pedido?: string;
    codigo_fornecedor: number;
    data_pedido: string;
    data_previsao?: string;
    observacoes?: string;
    status?: 'DIGITACAO' | 'APROVADO' | 'FATURADO' | 'CANCELADO';
    codigo_empresa?: number;
  };
  det: PedidoCompraItem[];
  informacoes_adicionais?: {
    codigo_conta_corrente?: number;
    codigo_categoria?: string;
    observacoes_internas?: string;
  };
}

export interface PedidoCompraItem {
  codigo_produto: string;
  descricao?: string;
  quantidade: number;
  valor_unitario: number;
  valor_total?: number;
  unidade?: string;
  observacao?: string;
}

export interface Cotacao {
  cabecalho: {
    codigo_cotacao?: string;
    numero_cotacao?: string;
    data_cotacao: string;
    data_validade?: string;
    observacoes?: string;
    status?: 'ATIVA' | 'EXPIRADA' | 'CANCELADA';
  };
  fornecedores: CotacaoFornecedor[];
  itens: CotacaoItem[];
}

export interface CotacaoFornecedor {
  codigo_fornecedor: number;
  razao_social?: string;
  data_resposta?: string;
  observacoes?: string;
}

export interface CotacaoItem {
  codigo_produto: string;
  descricao?: string;
  quantidade: number;
  unidade?: string;
  cotacoes_fornecedor: {
    codigo_fornecedor: number;
    valor_unitario?: number;
    prazo_entrega?: number;
    observacoes?: string;
  }[];
}

// FILTROS E LISTAGENS
export interface FiltroContasPagar {
  data_de?: string;
  data_ate?: string;
  status?: 'ABERTO' | 'PAGO' | 'CANCELADO';
  codigo_fornecedor?: number;
  codigo_categoria?: string;
  apenas_importado_api?: 'N' | 'S';
}

export interface FiltroContasReceber {
  data_de?: string;
  data_ate?: string;
  status?: 'ABERTO' | 'RECEBIDO' | 'CANCELADO';
  codigo_cliente?: number;
  codigo_categoria?: string;
  apenas_importado_api?: 'N' | 'S';
}

export interface FiltroPedidosCompra {
  data_de?: string;
  data_ate?: string;
  status?: 'DIGITACAO' | 'APROVADO' | 'FATURADO' | 'CANCELADO';
  codigo_fornecedor?: number;
  apenas_importado_api?: 'N' | 'S';
}

export interface ListagemPaginada<T> {
  registros_por_pagina: number;
  total_de_registros: number;
  pagina_atual: number;
  total_de_paginas: number;
  registros: T[];
}

// RESPONSES ESPECÍFICAS
export type ListaContasPagar = ListagemPaginada<ContaPagar>;
export type ListaContasReceber = ListagemPaginada<ContaReceber>;
export type ListaPedidosCompra = ListagemPaginada<PedidoCompra>;
export type ListaMovimentacoes = ListagemPaginada<MovimentacaoFinanceira>;

// ERRORS
export interface OmieError {
  faultcode: string;
  faultstring: string;
}

export function isOmieError(response: any): response is OmieError {
  return response && typeof response.faultcode === 'string' && typeof response.faultstring === 'string';
}