import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/trpc/trpc.server';
import { env } from '~/server/env';
import { createOmieClient } from './omie.client';
import {
  contaPagarSchema,
  contaPagarPagamentoSchema,
  contaReceberSchema,
  contaReceberRecebimentoSchema,
  movimentacaoFinanceiraSchema,
  pedidoCompraSchema,
  cotacaoSchema,
  listarContasPagarInputSchema,
  listarContasReceberInputSchema,
  listarPedidosCompraInputSchema,
  listarMovimentacoesInputSchema,
  consultarContaPagarInputSchema,
  consultarContaReceberInputSchema,
  consultarPedidoCompraInputSchema,
  consultarSaldoContaCorrenteInputSchema,
  paginacaoSchema,
} from './omie.schemas';

// Função helper para obter credentials do ambiente
function getOmieCredentials() {
  const appKey = env.OMIE_APP_KEY;
  const appSecret = env.OMIE_APP_SECRET;
  
  if (!appKey || !appSecret) {
    throw new Error('Credenciais do Omie não configuradas. Configure OMIE_APP_KEY e OMIE_APP_SECRET.');
  }
  
  return { appKey, appSecret };
}

export const omieRouter = createTRPCRouter({

  // ===== TESTE DE CONEXÃO =====
  testarConexao: publicProcedure
    .query(async () => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      
      const isConnected = await client.testarConexao();
      return { 
        conectado: isConnected,
        timestamp: new Date().toISOString(),
      };
    }),

  // ===== CONTAS A PAGAR =====
  criarContaPagar: publicProcedure
    .input(contaPagarSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.incluirContaPagar(input);
    }),

  alterarContaPagar: publicProcedure
    .input(contaPagarSchema.required({ codigo_conta_pagar: true }))
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.alterarContaPagar(input);
    }),

  excluirContaPagar: publicProcedure
    .input(consultarContaPagarInputSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.excluirContaPagar(input.codigo_conta_pagar);
    }),

  consultarContaPagar: publicProcedure
    .input(consultarContaPagarInputSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.consultarContaPagar(input.codigo_conta_pagar);
    }),

  listarContasPagar: publicProcedure
    .input(listarContasPagarInputSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarContasPagar(
        input.pagina,
        input.registros_por_pagina,
        input.filtros
      );
    }),

  pagarContaPagar: publicProcedure
    .input(contaPagarPagamentoSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.pagarContaPagar(input);
    }),

  // ===== CONTAS A RECEBER =====
  criarContaReceber: publicProcedure
    .input(contaReceberSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.incluirContaReceber(input);
    }),

  alterarContaReceber: publicProcedure
    .input(contaReceberSchema.required({ codigo_conta_receber: true }))
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.alterarContaReceber(input);
    }),

  excluirContaReceber: publicProcedure
    .input(consultarContaReceberInputSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.excluirContaReceber(input.codigo_conta_receber);
    }),

  consultarContaReceber: publicProcedure
    .input(consultarContaReceberInputSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.consultarContaReceber(input.codigo_conta_receber);
    }),

  listarContasReceber: publicProcedure
    .input(listarContasReceberInputSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarContasReceber(
        input.pagina,
        input.registros_por_pagina,
        input.filtros
      );
    }),

  receberContaReceber: publicProcedure
    .input(contaReceberRecebimentoSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.receberContaReceber(input);
    }),

  // ===== MOVIMENTAÇÃO FINANCEIRA =====
  criarMovimentacao: publicProcedure
    .input(movimentacaoFinanceiraSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.incluirMovimentacao(input);
    }),

  listarMovimentacoes: publicProcedure
    .input(listarMovimentacoesInputSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarMovimentacoes(
        input.codigo_conta_corrente,
        input.pagina,
        input.registros_por_pagina,
        {
          data_de: input.data_de,
          data_ate: input.data_ate,
        }
      );
    }),

  consultarSaldoContaCorrente: publicProcedure
    .input(consultarSaldoContaCorrenteInputSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.consultarSaldoContaCorrente(
        input.codigo_conta_corrente,
        input.data_saldo
      );
    }),

  listarContasCorrentes: publicProcedure
    .query(async () => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarContasCorrentes();
    }),

  // ===== COMPRAS =====
  criarPedidoCompra: publicProcedure
    .input(pedidoCompraSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.incluirPedidoCompra(input);
    }),

  alterarPedidoCompra: publicProcedure
    .input(pedidoCompraSchema.required({ 
      cabecalho: z.object({
        codigo_pedido: z.string().min(1),
      }).passthrough()
    }))
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.alterarPedidoCompra(input);
    }),

  excluirPedidoCompra: publicProcedure
    .input(consultarPedidoCompraInputSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.excluirPedidoCompra(input.codigo_pedido);
    }),

  consultarPedidoCompra: publicProcedure
    .input(consultarPedidoCompraInputSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.consultarPedidoCompra(input.codigo_pedido);
    }),

  listarPedidosCompra: publicProcedure
    .input(listarPedidosCompraInputSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarPedidosCompra(
        input.pagina,
        input.registros_por_pagina,
        input.filtros
      );
    }),

  faturarPedidoCompra: publicProcedure
    .input(z.object({
      codigo_pedido: z.string().min(1),
      dados_faturamento: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.faturarPedidoCompra(
        input.codigo_pedido,
        input.dados_faturamento
      );
    }),

  // ===== COTAÇÕES =====
  criarCotacao: publicProcedure
    .input(cotacaoSchema)
    .mutation(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.incluirCotacao(input);
    }),

  consultarCotacao: publicProcedure
    .input(z.object({ codigo_cotacao: z.string().min(1) }))
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.consultarCotacao(input.codigo_cotacao);
    }),

  listarCotacoes: publicProcedure
    .input(paginacaoSchema.extend({
      filtros: z.any().optional(),
    }))
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarCotacoes(
        input.pagina,
        input.registros_por_pagina,
        input.filtros
      );
    }),

  // ===== CADASTROS AUXILIARES =====
  listarClientes: publicProcedure
    .input(paginacaoSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarClientes(input.pagina, input.registros_por_pagina);
    }),

  consultarCliente: publicProcedure
    .input(z.object({ codigo_cliente: z.number().positive() }))
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.consultarCliente(input.codigo_cliente);
    }),

  listarFornecedores: publicProcedure
    .input(paginacaoSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarFornecedores(input.pagina, input.registros_por_pagina);
    }),

  consultarFornecedor: publicProcedure
    .input(z.object({ codigo_fornecedor: z.number().positive() }))
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.consultarFornecedor(input.codigo_fornecedor);
    }),

  listarProdutos: publicProcedure
    .input(paginacaoSchema)
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarProdutos(input.pagina, input.registros_por_pagina);
    }),

  consultarProduto: publicProcedure
    .input(z.object({ codigo_produto: z.string().min(1) }))
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.consultarProduto(input.codigo_produto);
    }),

  listarCategorias: publicProcedure
    .query(async () => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.listarCategorias();
    }),

  // ===== UTILITÁRIOS =====
  obterInfoEmpresa: publicProcedure
    .query(async () => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);
      return await client.obterInfoEmpresa();
    }),

  // ===== DASHBOARDS E RELATÓRIOS =====
  obterResumoFinanceiro: publicProcedure
    .input(z.object({
      data_de: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      data_ate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .query(async ({ input }) => {
      const credentials = getOmieCredentials();
      const client = createOmieClient(credentials);

      // Busca contas a pagar e receber em paralelo
      const [contasPagar, contasReceber] = await Promise.all([
        client.listarContasPagar(1, 1000, {
          data_de: input.data_de,
          data_ate: input.data_ate,
        }),
        client.listarContasReceber(1, 1000, {
          data_de: input.data_de,
          data_ate: input.data_ate,
        }),
      ]);

      // Calcula totais
      const totalPagar = contasPagar.registros?.reduce((acc: number, conta: any) => 
        acc + (conta.valor_documento || 0), 0) || 0;
      
      const totalReceber = contasReceber.registros?.reduce((acc: number, conta: any) => 
        acc + (conta.valor_documento || 0), 0) || 0;

      return {
        periodo: {
          data_de: input.data_de,
          data_ate: input.data_ate,
        },
        contas_pagar: {
          total: totalPagar,
          quantidade: contasPagar.total_de_registros || 0,
        },
        contas_receber: {
          total: totalReceber,
          quantidade: contasReceber.total_de_registros || 0,
        },
        saldo_liquido: totalReceber - totalPagar,
      };
    }),

});