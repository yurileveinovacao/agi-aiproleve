import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '~/common/trpc/trpc.client';

// TYPES
import type {
  ContaPagar,
  ContaReceber,
  PedidoCompra,
  MovimentacaoFinanceira,
  ListaContasPagar,
  ListaContasReceber,
  ListaPedidosCompra,
} from '../omie.types';

// QUERY KEYS
export const omieQueryKeys = {
  all: ['omie'] as const,
  conexao: () => [...omieQueryKeys.all, 'conexao'] as const,
  contasPagar: () => [...omieQueryKeys.all, 'contas-pagar'] as const,
  contasReceber: () => [...omieQueryKeys.all, 'contas-receber'] as const,
  pedidosCompra: () => [...omieQueryKeys.all, 'pedidos-compra'] as const,
  movimentacoes: () => [...omieQueryKeys.all, 'movimentacoes'] as const,
  saldo: (contaId: number) => [...omieQueryKeys.all, 'saldo', contaId] as const,
  resumoFinanceiro: (periodo: string) => [...omieQueryKeys.all, 'resumo', periodo] as const,
  clientes: () => [...omieQueryKeys.all, 'clientes'] as const,
  fornecedores: () => [...omieQueryKeys.all, 'fornecedores'] as const,
  produtos: () => [...omieQueryKeys.all, 'produtos'] as const,
};

// ===== TESTE DE CONEXÃO =====
export function useOmieConexao() {
  return useQuery({
    queryKey: omieQueryKeys.conexao(),
    queryFn: () => trpc.omie.testarConexao.query(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// ===== CONTAS A PAGAR =====
export function useContasPagar(
  pagina: number = 1,
  registrosPorPagina: number = 50,
  filtros?: any
) {
  return useQuery({
    queryKey: [...omieQueryKeys.contasPagar(), { pagina, registrosPorPagina, filtros }],
    queryFn: () => trpc.omie.listarContasPagar.query({
      pagina,
      registros_por_pagina: registrosPorPagina,
      filtros,
    }),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useContaPagar(codigoContaPagar?: string) {
  return useQuery({
    queryKey: [...omieQueryKeys.contasPagar(), 'detalhe', codigoContaPagar],
    queryFn: () => trpc.omie.consultarContaPagar.query({ codigo_conta_pagar: codigoContaPagar! }),
    enabled: !!codigoContaPagar,
  });
}

export function useCriarContaPagar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ContaPagar) => trpc.omie.criarContaPagar.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: omieQueryKeys.contasPagar() });
    },
  });
}

export function useAlterarContaPagar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ContaPagar & { codigo_conta_pagar: string }) => 
      trpc.omie.alterarContaPagar.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: omieQueryKeys.contasPagar() });
    },
  });
}

export function usePagarContaPagar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      codigo_conta_pagar: string;
      data_pagamento: string;
      valor_pagamento: number;
      codigo_conta_corrente?: number;
      observacao?: string;
      juros?: number;
      multa?: number;
      desconto?: number;
    }) => trpc.omie.pagarContaPagar.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: omieQueryKeys.contasPagar() });
    },
  });
}

// ===== CONTAS A RECEBER =====
export function useContasReceber(
  pagina: number = 1,
  registrosPorPagina: number = 50,
  filtros?: any
) {
  return useQuery({
    queryKey: [...omieQueryKeys.contasReceber(), { pagina, registrosPorPagina, filtros }],
    queryFn: () => trpc.omie.listarContasReceber.query({
      pagina,
      registros_por_pagina: registrosPorPagina,
      filtros,
    }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useContaReceber(codigoContaReceber?: string) {
  return useQuery({
    queryKey: [...omieQueryKeys.contasReceber(), 'detalhe', codigoContaReceber],
    queryFn: () => trpc.omie.consultarContaReceber.query({ codigo_conta_receber: codigoContaReceber! }),
    enabled: !!codigoContaReceber,
  });
}

export function useCriarContaReceber() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ContaReceber) => trpc.omie.criarContaReceber.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: omieQueryKeys.contasReceber() });
    },
  });
}

export function useReceberContaReceber() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      codigo_conta_receber: string;
      data_recebimento: string;
      valor_recebimento: number;
      codigo_conta_corrente?: number;
      observacao?: string;
      juros?: number;
      multa?: number;
      desconto?: number;
    }) => trpc.omie.receberContaReceber.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: omieQueryKeys.contasReceber() });
    },
  });
}

// ===== PEDIDOS DE COMPRA =====
export function usePedidosCompra(
  pagina: number = 1,
  registrosPorPagina: number = 50,
  filtros?: any
) {
  return useQuery({
    queryKey: [...omieQueryKeys.pedidosCompra(), { pagina, registrosPorPagina, filtros }],
    queryFn: () => trpc.omie.listarPedidosCompra.query({
      pagina,
      registros_por_pagina: registrosPorPagina,
      filtros,
    }),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePedidoCompra(codigoPedido?: string) {
  return useQuery({
    queryKey: [...omieQueryKeys.pedidosCompra(), 'detalhe', codigoPedido],
    queryFn: () => trpc.omie.consultarPedidoCompra.query({ codigo_pedido: codigoPedido! }),
    enabled: !!codigoPedido,
  });
}

export function useCriarPedidoCompra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PedidoCompra) => trpc.omie.criarPedidoCompra.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: omieQueryKeys.pedidosCompra() });
    },
  });
}

export function useFaturarPedidoCompra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { codigo_pedido: string; dados_faturamento?: any }) => 
      trpc.omie.faturarPedidoCompra.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: omieQueryKeys.pedidosCompra() });
    },
  });
}

// ===== MOVIMENTAÇÃO FINANCEIRA =====
export function useMovimentacoes(
  codigoContaCorrente?: number,
  pagina: number = 1,
  registrosPorPagina: number = 50,
  dataInicial?: string,
  dataFinal?: string
) {
  return useQuery({
    queryKey: [...omieQueryKeys.movimentacoes(), { 
      codigoContaCorrente, pagina, registrosPorPagina, dataInicial, dataFinal 
    }],
    queryFn: () => trpc.omie.listarMovimentacoes.query({
      codigo_conta_corrente: codigoContaCorrente,
      pagina,
      registros_por_pagina: registrosPorPagina,
      data_de: dataInicial,
      data_ate: dataFinal,
    }),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

export function useSaldoContaCorrente(codigoContaCorrente?: number, dataSaldo?: string) {
  return useQuery({
    queryKey: omieQueryKeys.saldo(codigoContaCorrente || 0),
    queryFn: () => trpc.omie.consultarSaldoContaCorrente.query({
      codigo_conta_corrente: codigoContaCorrente!,
      data_saldo: dataSaldo,
    }),
    enabled: !!codigoContaCorrente,
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useContasCorrentes() {
  return useQuery({
    queryKey: [...omieQueryKeys.all, 'contas-correntes'],
    queryFn: () => trpc.omie.listarContasCorrentes.query(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// ===== CADASTROS AUXILIARES =====
export function useClientes(pagina: number = 1, registrosPorPagina: number = 50) {
  return useQuery({
    queryKey: [...omieQueryKeys.clientes(), { pagina, registrosPorPagina }],
    queryFn: () => trpc.omie.listarClientes.query({ pagina, registros_por_pagina: registrosPorPagina }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFornecedores(pagina: number = 1, registrosPorPagina: number = 50) {
  return useQuery({
    queryKey: [...omieQueryKeys.fornecedores(), { pagina, registrosPorPagina }],
    queryFn: () => trpc.omie.listarFornecedores.query({ pagina, registros_por_pagina: registrosPorPagina }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProdutos(pagina: number = 1, registrosPorPagina: number = 50) {
  return useQuery({
    queryKey: [...omieQueryKeys.produtos(), { pagina, registrosPorPagina }],
    queryFn: () => trpc.omie.listarProdutos.query({ pagina, registros_por_pagina: registrosPorPagina }),
    staleTime: 5 * 60 * 1000,
  });
}

// ===== RESUMOS E DASHBOARDS =====
export function useResumoFinanceiro(dataInicial: string, dataFinal: string) {
  return useQuery({
    queryKey: omieQueryKeys.resumoFinanceiro(`${dataInicial}-${dataFinal}`),
    queryFn: () => trpc.omie.obterResumoFinanceiro.query({
      data_de: dataInicial,
      data_ate: dataFinal,
    }),
    enabled: !!dataInicial && !!dataFinal,
    staleTime: 2 * 60 * 1000,
  });
}

// ===== HELPERS =====
export function useInvalidateOmieQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: omieQueryKeys.all }),
    invalidateContasPagar: () => queryClient.invalidateQueries({ queryKey: omieQueryKeys.contasPagar() }),
    invalidateContasReceber: () => queryClient.invalidateQueries({ queryKey: omieQueryKeys.contasReceber() }),
    invalidatePedidosCompra: () => queryClient.invalidateQueries({ queryKey: omieQueryKeys.pedidosCompra() }),
    invalidateMovimentacoes: () => queryClient.invalidateQueries({ queryKey: omieQueryKeys.movimentacoes() }),
  };
}