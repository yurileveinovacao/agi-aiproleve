// Comandos de IA para integração com Omie ERP
// Este arquivo demonstra como a IA pode interpretar comandos em linguagem natural
// e executar tarefas específicas no ERP Omie

import { createOmieClient } from '../omie.client';
import type { OmieCredentials } from '../omie.types';

// Tipos para comandos de IA
export interface AiCommand {
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
}

export interface AiResponse {
  success: boolean;
  message: string;
  data?: any;
  suggestions?: string[];
}

// Classe principal para processar comandos de IA relacionados ao Omie
export class OmieAiCommandProcessor {
  private client: any;

  constructor(credentials: OmieCredentials) {
    this.client = createOmieClient(credentials);
  }

  /**
   * Processa um comando em linguagem natural e executa a ação correspondente
   */
  async processCommand(userMessage: string): Promise<AiResponse> {
    try {
      const command = this.parseCommand(userMessage);
      
      switch (command.intent) {
        case 'listar_contas_pagar_vencidas':
          return await this.listarContasPagarVencidas(command.parameters);
          
        case 'criar_conta_receber':
          return await this.criarContaReceber(command.parameters);
          
        case 'consultar_saldo':
          return await this.consultarSaldo(command.parameters);
          
        case 'criar_pedido_compra':
          return await this.criarPedidoCompra(command.parameters);
          
        case 'gerar_relatorio_financeiro':
          return await this.gerarRelatorioFinanceiro(command.parameters);
          
        case 'listar_clientes_atraso':
          return await this.listarClientesAtraso(command.parameters);
          
        default:
          return {
            success: false,
            message: 'Comando não reconhecido. Tente reformular sua solicitação.',
            suggestions: [
              'Mostre as contas a pagar vencidas',
              'Qual o saldo da conta principal?',
              'Crie uma conta a receber de R$ 5.000',
              'Liste os pedidos de compra pendentes'
            ]
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro ao processar comando: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  /**
   * Analisa o comando do usuário e identifica a intenção
   */
  private parseCommand(message: string): AiCommand {
    const normalizedMessage = message.toLowerCase().trim();

    // Padrões de reconhecimento para diferentes comandos
    const patterns = [
      {
        intent: 'listar_contas_pagar_vencidas',
        patterns: [
          /contas?\s+(a\s+)?pagar\s+vencidas?/,
          /pagamentos?\s+em\s+atraso/,
          /contas?\s+em\s+atraso/
        ],
        parameters: this.extractDateParameters(normalizedMessage)
      },
      {
        intent: 'criar_conta_receber',
        patterns: [
          /criar?\s+(uma\s+)?conta\s+(a\s+)?receber/,
          /registrar?\s+recebimento/,
          /nova\s+conta\s+receber/
        ],
        parameters: this.extractAccountReceivableParameters(normalizedMessage)
      },
      {
        intent: 'consultar_saldo',
        patterns: [
          /saldo\s+(atual\s+)?(da\s+)?conta/,
          /qual\s+(é\s+)?o\s+saldo/,
          /consultar?\s+saldo/
        ],
        parameters: this.extractAccountParameters(normalizedMessage)
      },
      {
        intent: 'criar_pedido_compra',
        patterns: [
          /criar?\s+(um\s+)?pedido\s+(de\s+)?compra/,
          /novo\s+pedido\s+compra/,
          /registrar?\s+compra/
        ],
        parameters: this.extractPurchaseOrderParameters(normalizedMessage)
      },
      {
        intent: 'gerar_relatorio_financeiro',
        patterns: [
          /relatório\s+financeiro/,
          /resumo\s+financeiro/,
          /fluxo\s+(de\s+)?caixa/
        ],
        parameters: this.extractReportParameters(normalizedMessage)
      },
      {
        intent: 'listar_clientes_atraso',
        patterns: [
          /clientes?\s+(em\s+)?atraso/,
          /devedores?/,
          /inadimplentes?/
        ],
        parameters: this.extractDateParameters(normalizedMessage)
      }
    ];

    for (const pattern of patterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(normalizedMessage)) {
          return {
            intent: pattern.intent,
            parameters: pattern.parameters,
            confidence: 0.8
          };
        }
      }
    }

    return {
      intent: 'unknown',
      parameters: {},
      confidence: 0.0
    };
  }

  // === IMPLEMENTAÇÃO DOS COMANDOS ===

  private async listarContasPagarVencidas(params: any): Promise<AiResponse> {
    const hoje = new Date().toISOString().split('T')[0];
    
    const contas = await this.client.listarContasPagar(1, 100, {
      status: 'ABERTO',
      data_ate: params.dataLimite || hoje
    });

    const contasVencidas = contas.registros.filter((conta: any) => 
      new Date(conta.data_vencimento) <= new Date(hoje)
    );

    const totalVencido = contasVencidas.reduce((acc: number, conta: any) => 
      acc + conta.valor_documento, 0);

    return {
      success: true,
      message: `Encontradas ${contasVencidas.length} contas vencidas no total de ${this.formatCurrency(totalVencido)}`,
      data: {
        contas: contasVencidas,
        total: totalVencido,
        quantidade: contasVencidas.length
      },
      suggestions: [
        'Efetuar pagamento das contas vencidas',
        'Gerar relatório de contas em atraso',
        'Negociar prazos com fornecedores'
      ]
    };
  }

  private async criarContaReceber(params: any): Promise<AiResponse> {
    if (!params.valor || !params.cliente) {
      return {
        success: false,
        message: 'Para criar uma conta a receber, preciso do valor e do cliente. Exemplo: "Crie uma conta de R$ 5.000 para o cliente João"'
      };
    }

    const conta = await this.client.incluirContaReceber({
      codigo_cliente: params.cliente,
      valor_documento: params.valor,
      data_vencimento: params.dataVencimento || this.getDefaultDueDate(),
      numero_documento: params.numeroDocumento || this.generateDocumentNumber(),
      observacao: params.observacao || 'Criado via IA'
    });

    return {
      success: true,
      message: `Conta a receber criada com sucesso! Valor: ${this.formatCurrency(params.valor)}`,
      data: conta,
      suggestions: [
        'Enviar cobrança para o cliente',
        'Agendar lembrete de vencimento',
        'Verificar histórico do cliente'
      ]
    };
  }

  private async consultarSaldo(params: any): Promise<AiResponse> {
    const contaCorrente = params.contaCorrente || 1; // Conta principal
    
    const saldo = await this.client.consultarSaldoContaCorrente(contaCorrente);
    
    return {
      success: true,
      message: `Saldo atual da conta: ${this.formatCurrency(saldo.saldo_atual)}`,
      data: saldo,
      suggestions: [
        'Ver extrato completo',
        'Gerar relatório de movimentações',
        'Comparar com saldo anterior'
      ]
    };
  }

  private async criarPedidoCompra(params: any): Promise<AiResponse> {
    if (!params.fornecedor || !params.itens) {
      return {
        success: false,
        message: 'Para criar um pedido de compra, preciso do fornecedor e dos itens. Exemplo: "Crie um pedido para o fornecedor ABC com 10 unidades do produto XYZ"'
      };
    }

    const pedido = await this.client.incluirPedidoCompra({
      cabecalho: {
        codigo_fornecedor: params.fornecedor,
        data_pedido: new Date().toISOString().split('T')[0],
        observacoes: params.observacoes || 'Criado via IA'
      },
      det: params.itens.map((item: any) => ({
        codigo_produto: item.codigo,
        quantidade: item.quantidade,
        valor_unitario: item.valor
      }))
    });

    const total = params.itens.reduce((acc: number, item: any) => 
      acc + (item.quantidade * item.valor), 0);

    return {
      success: true,
      message: `Pedido de compra criado! Total: ${this.formatCurrency(total)}`,
      data: pedido,
      suggestions: [
        'Enviar pedido para fornecedor',
        'Acompanhar status de aprovação',
        'Verificar prazo de entrega'
      ]
    };
  }

  private async gerarRelatorioFinanceiro(params: any): Promise<AiResponse> {
    const dataInicial = params.dataInicial || this.getMonthStart();
    const dataFinal = params.dataFinal || this.getToday();

    const [contasPagar, contasReceber] = await Promise.all([
      this.client.listarContasPagar(1, 1000, {
        data_de: dataInicial,
        data_ate: dataFinal
      }),
      this.client.listarContasReceber(1, 1000, {
        data_de: dataInicial,
        data_ate: dataFinal
      })
    ]);

    const totalPagar = contasPagar.registros.reduce((acc: number, conta: any) => 
      acc + conta.valor_documento, 0);
    
    const totalReceber = contasReceber.registros.reduce((acc: number, conta: any) => 
      acc + conta.valor_documento, 0);

    const saldoLiquido = totalReceber - totalPagar;

    return {
      success: true,
      message: `Relatório financeiro gerado para o período de ${dataInicial} a ${dataFinal}`,
      data: {
        periodo: { dataInicial, dataFinal },
        contasPagar: { total: totalPagar, quantidade: contasPagar.total_de_registros },
        contasReceber: { total: totalReceber, quantidade: contasReceber.total_de_registros },
        saldoLiquido
      },
      suggestions: [
        'Exportar relatório em PDF',
        'Comparar com período anterior',
        'Analisar fluxo de caixa futuro'
      ]
    };
  }

  private async listarClientesAtraso(params: any): Promise<AiResponse> {
    const hoje = new Date().toISOString().split('T')[0];
    
    const contas = await this.client.listarContasReceber(1, 1000, {
      status: 'ABERTO',
      data_ate: hoje
    });

    const contasVencidas = contas.registros.filter((conta: any) => 
      new Date(conta.data_vencimento) < new Date(hoje)
    );

    // Agrupar por cliente
    const clientesAtraso = this.groupByCustomer(contasVencidas);

    return {
      success: true,
      message: `${clientesAtraso.length} clientes com contas em atraso`,
      data: clientesAtraso,
      suggestions: [
        'Enviar notificação de cobrança',
        'Gerar relatório de inadimplência',
        'Bloquear clientes em atraso'
      ]
    };
  }

  // === FUNÇÕES AUXILIARES ===

  private extractDateParameters(message: string): any {
    const today = new Date().toISOString().split('T')[0];
    // Extrair datas específicas da mensagem
    // Implementação simplificada
    return { dataLimite: today };
  }

  private extractAccountReceivableParameters(message: string): any {
    // Extrair valor, cliente, etc.
    const valorMatch = message.match(/r\$?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i);
    const clienteMatch = message.match(/cliente\s+(\w+)/i);
    
    return {
      valor: valorMatch ? this.parseValue(valorMatch[1]) : null,
      cliente: clienteMatch ? clienteMatch[1] : null
    };
  }

  private extractAccountParameters(message: string): any {
    // Extrair conta específica
    return { contaCorrente: 1 }; // Padrão conta principal
  }

  private extractPurchaseOrderParameters(message: string): any {
    // Extrair fornecedor e itens
    return {
      fornecedor: null,
      itens: []
    };
  }

  private extractReportParameters(message: string): any {
    // Extrair período do relatório
    return {
      dataInicial: this.getMonthStart(),
      dataFinal: this.getToday()
    };
  }

  private parseValue(value: string): number {
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getMonthStart(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  }

  private getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 dias a partir de hoje
    return date.toISOString().split('T')[0];
  }

  private generateDocumentNumber(): string {
    return `AI-${Date.now()}`;
  }

  private groupByCustomer(contas: any[]): any[] {
    const grupos = new Map();
    
    contas.forEach(conta => {
      const clienteId = conta.codigo_cliente;
      if (!grupos.has(clienteId)) {
        grupos.set(clienteId, {
          codigo_cliente: clienteId,
          razao_social: conta.razao_social,
          contas: [],
          total: 0
        });
      }
      
      const grupo = grupos.get(clienteId);
      grupo.contas.push(conta);
      grupo.total += conta.valor_documento;
    });
    
    return Array.from(grupos.values());
  }
}

// Função factory para criar instância do processador
export function createOmieAiProcessor(credentials: OmieCredentials): OmieAiCommandProcessor {
  return new OmieAiCommandProcessor(credentials);
}

// Exemplos de uso
export const EXEMPLO_COMANDOS = [
  {
    comando: "Mostre as contas a pagar vencidas até hoje",
    resultado: "Listar todas as contas em atraso com totais"
  },
  {
    comando: "Crie uma conta a receber de R$ 5.000 para o cliente João",
    resultado: "Criar nova conta a receber com os dados especificados"
  },
  {
    comando: "Qual o saldo atual da conta principal?",
    resultado: "Consultar e exibir saldo da conta corrente"
  },
  {
    comando: "Gere um relatório financeiro do último mês",
    resultado: "Resumo completo de contas a pagar e receber"
  },
  {
    comando: "Liste os clientes em atraso",
    resultado: "Identificar clientes com contas vencidas"
  }
];