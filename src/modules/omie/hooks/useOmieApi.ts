import { apiQuery } from '~/common/util/trpc.client';

// TYPES
import type {
  ContaPagar,
  ContaReceber,
  PedidoCompra,
  MovimentacaoFinanceira,
  ListaContasPagar,
  ListaContasReceber,
  ListaPedidosCompra,
} from '~/modules/omie/omie.types';

// ===== TESTE DE CONEXÃO =====
export function useOmieConexao() {
  return apiQuery.omie.testarConexao.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// ===== CONTAS A PAGAR =====
export function useContasPagar(
  pagina: number = 1,
  registrosPorPagina: number = 50,
  filtros?: any
) {
  return apiQuery.omie.listarContasPagar.useQuery({
    pagina,
    registros_por_pagina: registrosPorPagina,
    filtros,
  }, {
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useContaPagar(codigoContaPagar?: string) {
  return apiQuery.omie.consultarContaPagar.useQuery(
    { codigo_conta_pagar: codigoContaPagar! },
    { enabled: !!codigoContaPagar }
  );
}

export function useCriarContaPagar() {
  return apiQuery.omie.criarContaPagar.useMutation();
}

export function useAlterarContaPagar() {
  return apiQuery.omie.alterarContaPagar.useMutation();
}

export function usePagarContaPagar() {
  return apiQuery.omie.pagarContaPagar.useMutation();
}

// ===== CONTAS A RECEBER =====
export function useContasReceber(
  pagina: number = 1,
  registrosPorPagina: number = 50,
  filtros?: any
) {
  return apiQuery.omie.listarContasReceber.useQuery({
    pagina,
    registros_por_pagina: registrosPorPagina,
    filtros,
  }, {
    staleTime: 2 * 60 * 1000,
  });
}

export function useContaReceber(codigoContaReceber?: string) {
  return apiQuery.omie.consultarContaReceber.useQuery(
    { codigo_conta_receber: codigoContaReceber! },
    { enabled: !!codigoContaReceber }
  );
}

export function useCriarContaReceber() {
  return apiQuery.omie.criarContaReceber.useMutation();
}

export function useReceberContaReceber() {
  return apiQuery.omie.receberContaReceber.useMutation();
}

// ===== PEDIDOS DE COMPRA =====
export function usePedidosCompra(
  pagina: number = 1,
  registrosPorPagina: number = 50,
  filtros?: any
) {
  return apiQuery.omie.listarPedidosCompra.useQuery({
    pagina,
    registros_por_pagina: registrosPorPagina,
    filtros,
  }, {
    staleTime: 2 * 60 * 1000,
  });
}

export function usePedidoCompra(codigoPedido?: string) {
  return apiQuery.omie.consultarPedidoCompra.useQuery(
    { codigo_pedido: codigoPedido! },
    { enabled: !!codigoPedido }
  );
}

export function useCriarPedidoCompra() {
  return apiQuery.omie.criarPedidoCompra.useMutation();
}

export function useFaturarPedidoCompra() {
  return apiQuery.omie.faturarPedidoCompra.useMutation();
}

// ===== MOVIMENTAÇÃO FINANCEIRA =====
export function useMovimentacoes(
  codigoContaCorrente?: number,
  pagina: number = 1,
  registrosPorPagina: number = 50,
  dataInicial?: string,
  dataFinal?: string
) {
  return apiQuery.omie.listarMovimentacoes.useQuery({
    codigo_conta_corrente: codigoContaCorrente,
    pagina,
    registros_por_pagina: registrosPorPagina,
    data_de: dataInicial,
    data_ate: dataFinal,
  }, {
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

export function useSaldoContaCorrente(codigoContaCorrente?: number, dataSaldo?: string) {
  return apiQuery.omie.consultarSaldoContaCorrente.useQuery({
    codigo_conta_corrente: codigoContaCorrente!,
    data_saldo: dataSaldo,
  }, {
    enabled: !!codigoContaCorrente,
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useContasCorrentes() {
  return apiQuery.omie.listarContasCorrentes.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// ===== CADASTROS AUXILIARES =====
export function useClientes(pagina: number = 1, registrosPorPagina: number = 50) {
  return apiQuery.omie.listarClientes.useQuery({
    pagina,
    registros_por_pagina: registrosPorPagina
  }, {
    staleTime: 5 * 60 * 1000,
  });
}

export function useFornecedores(pagina: number = 1, registrosPorPagina: number = 50) {
  return apiQuery.omie.listarFornecedores.useQuery({
    pagina,
    registros_por_pagina: registrosPorPagina
  }, {
    staleTime: 5 * 60 * 1000,
  });
}

export function useProdutos(pagina: number = 1, registrosPorPagina: number = 50) {
  return apiQuery.omie.listarProdutos.useQuery({
    pagina,
    registros_por_pagina: registrosPorPagina
  }, {
    staleTime: 5 * 60 * 1000,
  });
}

// ===== RESUMOS E DASHBOARDS =====
export function useResumoFinanceiro(dataInicial: string, dataFinal: string) {
  return apiQuery.omie.obterResumoFinanceiro.useQuery({
    data_de: dataInicial,
    data_ate: dataFinal,
  }, {
    enabled: !!dataInicial && !!dataFinal,
    staleTime: 2 * 60 * 1000,
  });
}