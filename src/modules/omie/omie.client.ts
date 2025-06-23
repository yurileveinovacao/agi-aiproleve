import { TRPCError } from '@trpc/server';
import type { 
  OmieCredentials, 
  OmieApiRequest, 
  OmieApiResponse, 
  OmieError,
  isOmieError 
} from './omie.types';

/**
 * Cliente HTTP para comunicação com a API do Omie
 */
export class OmieClient {
  private readonly credentials: OmieCredentials;
  private readonly baseUrl: string;

  constructor(credentials: OmieCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl || 'https://app.omie.com.br/api/v1/';
  }

  /**
   * Executa uma chamada para a API do Omie
   */
  async call<T = any>(
    endpoint: string,
    action: string,
    params: any[] = []
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const payload: OmieApiRequest = {
      call: action,
      app_key: this.credentials.appKey,
      app_secret: this.credentials.appSecret,
      param: params,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'big-agi-omie-integration/1.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
        });
      }

      const data: OmieApiResponse<T> = await response.json();

      // Verifica se houve erro na resposta da API do Omie
      if (data.faultstring || data.faultcode) {
        const omieError = data as OmieError;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Omie API Error [${omieError.faultcode}]: ${omieError.faultstring}`,
          cause: omieError,
        });
      }

      return data.resultado || data;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      // Erro de rede ou parsing
      console.error('Omie API call failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to call Omie API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        cause: error,
      });
    }
  }

  // CONTAS A PAGAR
  async incluirContaPagar(contaPagar: any) {
    return this.call('financas/contapagar/', 'IncluirContaPagar', [contaPagar]);
  }

  async alterarContaPagar(contaPagar: any) {
    return this.call('financas/contapagar/', 'AlterarContaPagar', [contaPagar]);
  }

  async excluirContaPagar(codigoContaPagar: string) {
    return this.call('financas/contapagar/', 'ExcluirContaPagar', [{ codigo_conta_pagar: codigoContaPagar }]);
  }

  async consultarContaPagar(codigoContaPagar: string) {
    return this.call('financas/contapagar/', 'ConsultarContaPagar', [{ codigo_conta_pagar: codigoContaPagar }]);
  }

  async listarContasPagar(pagina: number = 1, registrosPorPagina: number = 50, filtros: any = {}) {
    return this.call('financas/contapagar/', 'ListarContasPagar', [
      {
        pagina,
        registros_por_pagina: registrosPorPagina,
        ...filtros,
      },
    ]);
  }

  async pagarContaPagar(pagamento: any) {
    return this.call('financas/contapagar/', 'PagarContaPagar', [pagamento]);
  }

  // CONTAS A RECEBER
  async incluirContaReceber(contaReceber: any) {
    return this.call('financas/contareceber/', 'IncluirContaReceber', [contaReceber]);
  }

  async alterarContaReceber(contaReceber: any) {
    return this.call('financas/contareceber/', 'AlterarContaReceber', [contaReceber]);
  }

  async excluirContaReceber(codigoContaReceber: string) {
    return this.call('financas/contareceber/', 'ExcluirContaReceber', [{ codigo_conta_receber: codigoContaReceber }]);
  }

  async consultarContaReceber(codigoContaReceber: string) {
    return this.call('financas/contareceber/', 'ConsultarContaReceber', [{ codigo_conta_receber: codigoContaReceber }]);
  }

  async listarContasReceber(pagina: number = 1, registrosPorPagina: number = 50, filtros: any = {}) {
    return this.call('financas/contareceber/', 'ListarContasReceber', [
      {
        pagina,
        registros_por_pagina: registrosPorPagina,
        ...filtros,
      },
    ]);
  }

  async receberContaReceber(recebimento: any) {
    return this.call('financas/contareceber/', 'ReceberContaReceber', [recebimento]);
  }

  // CONTA CORRENTE / MOVIMENTAÇÃO
  async listarMovimentacoes(codigoContaCorrente?: number, pagina: number = 1, registrosPorPagina: number = 50, filtros: any = {}) {
    return this.call('financas/movimentacao/', 'ListarMovimentacoes', [
      {
        pagina,
        registros_por_pagina: registrosPorPagina,
        codigo_conta_corrente: codigoContaCorrente,
        ...filtros,
      },
    ]);
  }

  async incluirMovimentacao(movimentacao: any) {
    return this.call('financas/movimentacao/', 'IncluirMovimentacao', [movimentacao]);
  }

  async consultarSaldoContaCorrente(codigoContaCorrente: number, dataSaldo?: string) {
    return this.call('financas/contacorrente/', 'ConsultarSaldo', [
      {
        codigo_conta_corrente: codigoContaCorrente,
        ...(dataSaldo && { data_saldo: dataSaldo }),
      },
    ]);
  }

  async listarContasCorrentes() {
    return this.call('financas/contacorrente/', 'ListarContasCorrentes', []);
  }

  // COMPRAS
  async incluirPedidoCompra(pedidoCompra: any) {
    return this.call('produtos/pedidocompra/', 'IncluirPedidoCompra', [pedidoCompra]);
  }

  async alterarPedidoCompra(pedidoCompra: any) {
    return this.call('produtos/pedidocompra/', 'AlterarPedidoCompra', [pedidoCompra]);
  }

  async excluirPedidoCompra(codigoPedido: string) {
    return this.call('produtos/pedidocompra/', 'ExcluirPedidoCompra', [{ codigo_pedido: codigoPedido }]);
  }

  async consultarPedidoCompra(codigoPedido: string) {
    return this.call('produtos/pedidocompra/', 'ConsultarPedidoCompra', [{ codigo_pedido: codigoPedido }]);
  }

  async listarPedidosCompra(pagina: number = 1, registrosPorPagina: number = 50, filtros: any = {}) {
    return this.call('produtos/pedidocompra/', 'ListarPedidosCompra', [
      {
        pagina,
        registros_por_pagina: registrosPorPagina,
        ...filtros,
      },
    ]);
  }

  async faturarPedidoCompra(codigoPedido: string, dadosFaturamento: any = {}) {
    return this.call('produtos/pedidocompra/', 'FaturarPedidoCompra', [
      {
        codigo_pedido: codigoPedido,
        ...dadosFaturamento,
      },
    ]);
  }

  // COTAÇÕES
  async incluirCotacao(cotacao: any) {
    return this.call('produtos/cotacao/', 'IncluirCotacao', [cotacao]);
  }

  async consultarCotacao(codigoCotacao: string) {
    return this.call('produtos/cotacao/', 'ConsultarCotacao', [{ codigo_cotacao: codigoCotacao }]);
  }

  async listarCotacoes(pagina: number = 1, registrosPorPagina: number = 50, filtros: any = {}) {
    return this.call('produtos/cotacao/', 'ListarCotacoes', [
      {
        pagina,
        registros_por_pagina: registrosPorPagina,
        ...filtros,
      },
    ]);
  }

  // CADASTROS AUXILIARES
  async listarClientes(pagina: number = 1, registrosPorPagina: number = 50) {
    return this.call('geral/clientes/', 'ListarClientes', [
      {
        pagina,
        registros_por_pagina: registrosPorPagina,
      },
    ]);
  }

  async consultarCliente(codigoCliente: number) {
    return this.call('geral/clientes/', 'ConsultarCliente', [{ codigo_cliente_omie: codigoCliente }]);
  }

  async listarFornecedores(pagina: number = 1, registrosPorPagina: number = 50) {
    return this.call('geral/clientes/', 'ListarClientes', [
      {
        pagina,
        registros_por_pagina: registrosPorPagina,
        clientesFornecedores: 'fornecedores',
      },
    ]);
  }

  async consultarFornecedor(codigoFornecedor: number) {
    return this.call('geral/clientes/', 'ConsultarCliente', [{ codigo_cliente_omie: codigoFornecedor }]);
  }

  async listarProdutos(pagina: number = 1, registrosPorPagina: number = 50) {
    return this.call('geral/produtos/', 'ListarProdutos', [
      {
        pagina,
        registros_por_pagina: registrosPorPagina,
      },
    ]);
  }

  async consultarProduto(codigoProduto: string) {
    return this.call('geral/produtos/', 'ConsultarProduto', [{ codigo: codigoProduto }]);
  }

  async listarCategorias() {
    return this.call('geral/categorias/', 'ListarCategorias', []);
  }

  // UTILITÁRIOS
  async testarConexao(): Promise<boolean> {
    try {
      await this.listarContasCorrentes();
      return true;
    } catch (error) {
      console.error('Teste de conexão Omie falhou:', error);
      return false;
    }
  }

  async obterInfoEmpresa() {
    return this.call('geral/empresas/', 'ListarEmpresas', []);
  }
}

/**
 * Factory function para criar instância do cliente Omie
 */
export function createOmieClient(credentials: OmieCredentials): OmieClient {
  return new OmieClient(credentials);
}

/**
 * Função helper para tratar erros da API do Omie
 */
export function handleOmieError(error: unknown): never {
  if (error instanceof TRPCError) {
    throw error;
  }

  console.error('Unexpected Omie error:', error);
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Erro inesperado na comunicação com Omie',
    cause: error,
  });
}