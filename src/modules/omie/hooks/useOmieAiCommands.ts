import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOmieAiProcessor, type AiResponse } from '../ai-commands/omieCommands';
import type { OmieCredentials } from '../omie.types';

// Hook para integração de comandos IA com o sistema de chat
export function useOmieAiCommands() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<AiResponse | null>(null);

  // Credenciais do Omie (podem vir de environment ou contexto)
  const credentials: OmieCredentials = {
    appKey: typeof window !== 'undefined' ? '' : process.env.OMIE_APP_KEY || '',
    appSecret: typeof window !== 'undefined' ? '' : process.env.OMIE_APP_SECRET || '',
  };

  // Mutation para processar comandos da IA
  const processCommandMutation = useMutation({
    mutationFn: async (message: string): Promise<AiResponse> => {
      setIsProcessing(true);
      
      if (!credentials.appKey || !credentials.appSecret) {
        return {
          success: false,
          message: 'Credenciais do Omie não configuradas. Configure OMIE_APP_KEY e OMIE_APP_SECRET.',
          suggestions: [
            'Verificar variáveis de ambiente',
            'Contatar administrador do sistema',
            'Consultar documentação de configuração'
          ]
        };
      }

      try {
        const processor = createOmieAiProcessor(credentials);
        const response = await processor.processCommand(message);
        setLastResponse(response);
        
        // Invalidar queries relacionadas se a operação foi bem-sucedida
        if (response.success) {
          await queryClient.invalidateQueries({ 
            queryKey: ['omie'] 
          });
        }
        
        return response;
      } catch (error) {
        const errorResponse: AiResponse = {
          success: false,
          message: `Erro ao processar comando: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          suggestions: [
            'Verificar conexão com a internet',
            'Tentar novamente em alguns segundos',
            'Reformular o comando'
          ]
        };
        setLastResponse(errorResponse);
        return errorResponse;
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (response: AiResponse) => {
      console.log('Comando IA processado:', response);
    },
    onError: (error: Error) => {
      console.error('Erro ao processar comando IA:', error);
    }
  });

  // Função para executar comando
  const executeCommand = useCallback(
    (message: string) => {
      return processCommandMutation.mutateAsync(message);
    },
    [processCommandMutation]
  );

  // Função para verificar se uma mensagem é um comando Omie
  const isOmieCommand = useCallback((message: string): boolean => {
    const omieKeywords = [
      'omie', 'erp', 'conta', 'pagar', 'receber', 'pedido', 'compra',
      'fornecedor', 'cliente', 'financeiro', 'saldo', 'relatório',
      'vencida', 'atraso', 'pagamento', 'cobrança', 'inadimplente'
    ];
    
    const normalizedMessage = message.toLowerCase();
    return omieKeywords.some(keyword => normalizedMessage.includes(keyword));
  }, []);

  // Função para obter sugestões de comandos
  const getCommandSuggestions = useCallback((): string[] => {
    return [
      'Mostre as contas a pagar vencidas até hoje',
      'Crie uma conta a receber para o cliente João no valor de R$ 5.000',
      'Qual o saldo atual da conta principal?',
      'Liste os pedidos de compra aprovados desta semana',
      'Gere um relatório financeiro do último mês',
      'Quais clientes estão em atraso?',
      'Mostrar resumo de contas abertas',
      'Criar pedido de compra para fornecedor ABC'
    ];
  }, []);

  return {
    // Estado
    isProcessing,
    lastResponse,
    hasCredentials: !!(credentials.appKey && credentials.appSecret),
    
    // Funções
    executeCommand,
    isOmieCommand,
    getCommandSuggestions,
    
    // Estado da mutation
    isLoading: processCommandMutation.isPending,
    error: processCommandMutation.error,
    
    // Reset
    reset: () => {
      setLastResponse(null);
      processCommandMutation.reset();
    }
  };
}

// Hook simplificado para uso em componentes de chat
export function useOmieChat() {
  const aiCommands = useOmieAiCommands();
  
  const handleMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!aiCommands.isOmieCommand(message)) {
        return "Esta mensagem não parece ser um comando relacionado ao Omie ERP. Tente comandos como 'mostrar contas vencidas' ou 'criar conta a receber'.";
      }
      
      try {
        const response = await aiCommands.executeCommand(message);
        
        let reply = response.message;
        
        if (response.data) {
          // Adicionar informações específicas dos dados retornados
          if (response.data.contas && Array.isArray(response.data.contas)) {
            reply += `\n\n📄 **Contas encontradas**: ${response.data.contas.length}`;
            if (response.data.total) {
              reply += `\n💰 **Total**: R$ ${response.data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }
          }
          
          if (response.data.saldo_atual !== undefined) {
            reply += `\n\n💳 **Saldo**: R$ ${response.data.saldo_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
        }
        
        if (response.suggestions && response.suggestions.length > 0) {
          reply += '\n\n💡 **Sugestões**:\n';
          response.suggestions.forEach((suggestion: string) => {
            reply += `• ${suggestion}\n`;
          });
        }
        
        return reply;
      } catch (error) {
        return `❌ Erro ao processar comando: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      }
    },
    [aiCommands]
  );
  
  return {
    handleMessage,
    isProcessing: aiCommands.isProcessing,
    hasCredentials: aiCommands.hasCredentials,
    getCommandSuggestions: aiCommands.getCommandSuggestions,
  };
}

// Exemplo de como integrar com o sistema de chat do big-AGI
export function createOmieChatHandler() {
  return {
    name: 'Omie ERP',
    description: 'Executa comandos relacionados ao ERP Omie',
    
    canHandle: (message: string): boolean => {
      const omieKeywords = [
        'omie', 'erp', 'conta', 'pagar', 'receber', 'pedido', 'compra',
        'fornecedor', 'cliente', 'financeiro', 'saldo', 'relatório'
      ];
      
      const normalizedMessage = message.toLowerCase();
      return omieKeywords.some(keyword => normalizedMessage.includes(keyword));
    },
    
    handle: async (message: string): Promise<string> => {
      const credentials: OmieCredentials = {
        appKey: typeof window !== 'undefined' ? '' : process.env.OMIE_APP_KEY || '',
        appSecret: typeof window !== 'undefined' ? '' : process.env.OMIE_APP_SECRET || '',
      };
      
      if (!credentials.appKey || !credentials.appSecret) {
        return '⚠️ Credenciais do Omie não configuradas. Configure as variáveis de ambiente OMIE_APP_KEY e OMIE_APP_SECRET.';
      }
      
      try {
        const processor = createOmieAiProcessor(credentials);
        const response = await processor.processCommand(message);
        
        let reply = response.success ? '✅ ' : '❌ ';
        reply += response.message;
        
        if (response.suggestions && response.suggestions.length > 0) {
          reply += '\n\n💡 **Próximas ações sugeridas**:\n';
          response.suggestions.forEach(suggestion => {
            reply += `• ${suggestion}\n`;
          });
        }
        
        return reply;
      } catch (error) {
        return `❌ Erro ao executar comando Omie: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      }
    },
    
    getSuggestions: (): string[] => [
      'Mostrar contas a pagar vencidas',
      'Listar contas a receber em aberto',
      'Consultar saldo da conta principal',
      'Gerar relatório financeiro mensal',
      'Criar nova conta a receber',
      'Listar pedidos de compra aprovados'
    ]
  };
}