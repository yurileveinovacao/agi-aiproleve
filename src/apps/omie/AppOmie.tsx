import * as React from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton, Sheet, Stack, Table, Typography } from '@mui/joy';
import {
  CheckCircle,
  Error,
  Refresh,
  AccountBalance,
  Payment,
  ShoppingCart
} from '@mui/icons-material';


// Hooks do Omie
import {
  useOmieConexao,
  useContasPagar,
  useContasReceber,
  usePedidosCompra,
  useResumoFinanceiro,
  useContasCorrentes,
  useSaldoContaCorrente,
} from '~/modules/omie/hooks/useOmieApi';

// Tipos
import type { ContaPagar, ContaReceber, PedidoCompra } from '~/modules/omie/omie.types';

// Formatação de valores
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => 
  new Date(dateString).toLocaleDateString('pt-BR');

interface AppOmieProps {
  onClose?: () => void;
}

export function AppOmie({ onClose }: AppOmieProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<{
    data_de: string;
    data_ate: string;
  }>(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      data_de: firstDay.toISOString().split('T')[0],
      data_ate: today.toISOString().split('T')[0],
    };
  });

  // Queries
  const conexaoQuery = useOmieConexao();
  const resumoQuery = useResumoFinanceiro(selectedPeriod.data_de, selectedPeriod.data_ate);
  const contasPagarQuery = useContasPagar(1, 10, {
    status: 'ABERTO',
    data_de: selectedPeriod.data_de,
    data_ate: selectedPeriod.data_ate,
  });
  const contasReceberQuery = useContasReceber(1, 10, {
    status: 'ABERTO',
    data_de: selectedPeriod.data_de,
    data_ate: selectedPeriod.data_ate,
  });
  const pedidosCompraQuery = usePedidosCompra(1, 10, {
    status: 'APROVADO',
    data_de: selectedPeriod.data_de,
    data_ate: selectedPeriod.data_ate,
  });
  const contasCorrentesQuery = useContasCorrentes();

  // Status da conexão
  const isConnected = conexaoQuery.data?.conectado;
  const isLoading = conexaoQuery.isLoading;

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <Sheet
        variant="solid"
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'primary.600',
        }}
      >
        <Typography level="h4" sx={{ color: 'primary.50' }}>
          🔗 Omie ERP Integration
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Status da Conexão */}
          <Chip
            variant="soft"
            color={isConnected ? 'success' : 'danger'}
            startDecorator={isConnected ? <CheckCircle /> : <Error />}
            sx={{ bgcolor: 'background.surface' }}
          >
            {isLoading ? 'Conectando...' : isConnected ? 'Conectado' : 'Desconectado'}
          </Chip>

          <IconButton
            variant="soft"
            color="neutral"
            onClick={() => conexaoQuery.refetch()}
            loading={conexaoQuery.isFetching}
          >
            <Refresh />
          </IconButton>

          {onClose && (
            <Button variant="soft" color="neutral" onClick={onClose}>
              Fechar
            </Button>
          )}
        </Stack>
      </Sheet>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {!isConnected ? (
          <Card color="warning" variant="soft" sx={{ mb: 2 }}>
            <CardContent>
              <Typography level="title-md">⚠️ Configuração Necessária</Typography>
              <Typography level="body-sm">
                Configure as variáveis de ambiente OMIE_APP_KEY e OMIE_APP_SECRET para conectar com o ERP.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            
            {/* Resumo Financeiro */}
            <Grid xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography level="title-lg" startDecorator={<AccountBalance />}>
                    Resumo Financeiro - {formatDate(selectedPeriod.data_de)} a {formatDate(selectedPeriod.data_ate)}
                  </Typography>
                  
                  {resumoQuery.data && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid xs={12} sm={4}>
                        <Card variant="soft" color="danger">
                          <CardContent>
                            <Typography level="body-sm">Contas a Pagar</Typography>
                            <Typography level="h4">
                              {formatCurrency(resumoQuery.data.contas_pagar.total)}
                            </Typography>
                            <Typography level="body-xs">
                              {resumoQuery.data.contas_pagar.quantidade} contas
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid xs={12} sm={4}>
                        <Card variant="soft" color="success">
                          <CardContent>
                            <Typography level="body-sm">Contas a Receber</Typography>
                            <Typography level="h4">
                              {formatCurrency(resumoQuery.data.contas_receber.total)}
                            </Typography>
                            <Typography level="body-xs">
                              {resumoQuery.data.contas_receber.quantidade} contas
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid xs={12} sm={4}>
                        <Card variant="soft" color={resumoQuery.data.saldo_liquido >= 0 ? 'primary' : 'warning'}>
                          <CardContent>
                            <Typography level="body-sm">Saldo Líquido</Typography>
                            <Typography level="h4">
                              {formatCurrency(resumoQuery.data.saldo_liquido)}
                            </Typography>
                            <Typography level="body-xs">
                              {resumoQuery.data.saldo_liquido >= 0 ? 'Positivo' : 'Negativo'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Contas a Pagar */}
            <Grid xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography level="title-md" startDecorator={<Payment />} sx={{ mb: 2 }}>
                    Contas a Pagar (Abertas)
                  </Typography>
                  
                  {contasPagarQuery.data?.registros?.length ? (
                    <Table size="sm">
                      <thead>
                        <tr>
                          <th>Fornecedor</th>
                          <th>Vencimento</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contasPagarQuery.data.registros.slice(0, 5).map((conta: any, index: number) => (
                          <tr key={index}>
                            <td>{conta.razao_social || `Fornecedor ${conta.codigo_fornecedor}`}</td>
                            <td>{formatDate(conta.data_vencimento)}</td>
                            <td>{formatCurrency(conta.valor_documento)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Typography level="body-sm" sx={{ fontStyle: 'italic' }}>
                      Nenhuma conta a pagar encontrada
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Contas a Receber */}
            <Grid xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography level="title-md" startDecorator={<AccountBalance />} sx={{ mb: 2 }}>
                    Contas a Receber (Abertas)
                  </Typography>
                  
                  {contasReceberQuery.data?.registros?.length ? (
                    <Table size="sm">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Vencimento</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contasReceberQuery.data.registros.slice(0, 5).map((conta: any, index: number) => (
                          <tr key={index}>
                            <td>{conta.razao_social || `Cliente ${conta.codigo_cliente}`}</td>
                            <td>{formatDate(conta.data_vencimento)}</td>
                            <td>{formatCurrency(conta.valor_documento)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Typography level="body-sm" sx={{ fontStyle: 'italic' }}>
                      Nenhuma conta a receber encontrada
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Pedidos de Compra */}
            <Grid xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography level="title-md" startDecorator={<ShoppingCart />} sx={{ mb: 2 }}>
                    Pedidos de Compra (Aprovados)
                  </Typography>
                  
                  {pedidosCompraQuery.data?.registros?.length ? (
                    <Table>
                      <thead>
                        <tr>
                          <th>Número</th>
                          <th>Fornecedor</th>
                          <th>Data</th>
                          <th>Status</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosCompraQuery.data.registros.map((pedido: any, index: number) => (
                          <tr key={index}>
                            <td>{pedido.cabecalho.numero_pedido || pedido.cabecalho.codigo_pedido}</td>
                            <td>{pedido.cabecalho.razao_social || `Fornecedor ${pedido.cabecalho.codigo_fornecedor}`}</td>
                            <td>{formatDate(pedido.cabecalho.data_pedido)}</td>
                            <td>
                              <Chip size="sm" color="primary">
                                {pedido.cabecalho.status}
                              </Chip>
                            </td>
                            <td>{formatCurrency(pedido.total_pedido || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Typography level="body-sm" sx={{ fontStyle: 'italic' }}>
                      Nenhum pedido de compra encontrado
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Exemplos de Comandos IA */}
            <Grid xs={12}>
              <Card variant="outlined" color="neutral">
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 2 }}>
                    💡 Exemplos de Comandos para IA
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Typography level="body-sm">
                      • "Mostre as contas a pagar vencidas até hoje"
                    </Typography>
                    <Typography level="body-sm">
                      • "Crie uma conta a receber para o cliente X no valor de R$ 5.000"
                    </Typography>
                    <Typography level="body-sm">
                      • "Qual o saldo atual da conta principal?"
                    </Typography>
                    <Typography level="body-sm">
                      • "Liste os pedidos de compra pendentes de faturamento"
                    </Typography>
                    <Typography level="body-sm">
                      • "Gere um relatório de fluxo de caixa dos próximos 30 dias"
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default AppOmie;