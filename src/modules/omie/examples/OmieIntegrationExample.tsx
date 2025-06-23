import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Divider, Stack, Textarea, Typography, Alert } from '@mui/joy';
import { useOmieChat, useOmieAiCommands } from '../hooks/useOmieAiCommands';
import { SmartToyIcon, SendIcon, AccountBalanceIcon } from '@mui/icons-material';

/**
 * Exemplo completo de integração Omie ERP com IA
 * Demonstra como usar comandos em linguagem natural para executar tarefas no ERP
 */
export function OmieIntegrationExample() {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ user: string; ai: string; timestamp: Date }>>([]);
  
  const { handleMessage, isProcessing, hasCredentials, getCommandSuggestions } = useOmieChat();
  const aiCommands = useOmieAiCommands();

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const timestamp = new Date();
    const userMsg = userMessage.trim();
    setUserMessage('');

    try {
      const aiResponse = await handleMessage(userMsg);
      setChatHistory(prev => [...prev, {
        user: userMsg,
        ai: aiResponse,
        timestamp
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        user: userMsg,
        ai: `❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp
      }]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserMessage(suggestion);
  };

  const clearChat = () => {
    setChatHistory([]);
    aiCommands.reset();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography level="h3" startDecorator={<AccountBalanceIcon />}>
            🤖 Omie ERP + IA Assistant
          </Typography>
          <Typography level="body-md" sx={{ mt: 1 }}>
            Execute tarefas do ERP Omie usando comandos em linguagem natural
          </Typography>
          
          {/* Status da Conexão */}
          {!hasCredentials && (
            <Alert color="warning" sx={{ mt: 2 }}>
              ⚠️ Configure as variáveis OMIE_APP_KEY e OMIE_APP_SECRET para usar a integração
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography level="title-md" startDecorator={<SmartToyIcon />}>
                Chat com IA
              </Typography>
              {chatHistory.length > 0 && (
                <Button variant="soft" size="sm" onClick={clearChat}>
                  Limpar Chat
                </Button>
              )}
            </Box>

            {/* Histórico do Chat */}
            <Box 
              sx={{ 
                maxHeight: 400, 
                overflow: 'auto', 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 'md',
                p: 2,
                bgcolor: 'background.level1'
              }}
            >
              {chatHistory.length === 0 ? (
                <Typography level="body-sm" sx={{ textAlign: 'center', color: 'text.tertiary' }}>
                  Digite um comando relacionado ao Omie ERP para começar...
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {chatHistory.map((entry, index) => (
                    <Box key={index}>
                      {/* Mensagem do Usuário */}
                      <Box sx={{ textAlign: 'right', mb: 1 }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            bgcolor: 'primary.500',
                            color: 'primary.50',
                            px: 2,
                            py: 1,
                            borderRadius: 'lg',
                            maxWidth: '70%'
                          }}
                        >
                          <Typography level="body-sm">{entry.user}</Typography>
                        </Box>
                      </Box>

                      {/* Resposta da IA */}
                      <Box sx={{ textAlign: 'left' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            bgcolor: 'neutral.100',
                            px: 2,
                            py: 1,
                            borderRadius: 'lg',
                            maxWidth: '70%'
                          }}
                        >
                          <Typography 
                            level="body-sm" 
                            sx={{ whiteSpace: 'pre-wrap' }}
                          >
                            {entry.ai}
                          </Typography>
                        </Box>
                        <Typography 
                          level="body-xs" 
                          sx={{ 
                            color: 'text.tertiary', 
                            mt: 0.5, 
                            ml: 1 
                          }}
                        >
                          {entry.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Input de Mensagem */}
            <Stack direction="row" spacing={1}>
              <Textarea
                placeholder="Digite seu comando... Ex: Mostre as contas vencidas"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                minRows={1}
                maxRows={3}
                sx={{ flex: 1 }}
                disabled={isProcessing || !hasCredentials}
              />
              <Button
                variant="solid"
                color="primary"
                onClick={handleSendMessage}
                loading={isProcessing}
                disabled={!userMessage.trim() || !hasCredentials}
                startDecorator={<SendIcon />}
              >
                Enviar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Sugestões de Comandos */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-md" sx={{ mb: 2 }}>
            💡 Comandos Sugeridos
          </Typography>
          
          <Stack spacing={1}>
            {getCommandSuggestions().map((suggestion, index) => (
              <Button
                key={index}
                variant="soft"
                color="neutral"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{ 
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  fontWeight: 'normal'
                }}
                disabled={!hasCredentials}
              >
                {suggestion}
              </Button>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            <strong>Dica:</strong> Você pode usar comandos como:
            <br />• "Contas vencidas até hoje"
            <br />• "Criar conta R$ 5000 cliente João"  
            <br />• "Saldo da conta principal"
            <br />• "Relatório financeiro mensal"
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default OmieIntegrationExample;