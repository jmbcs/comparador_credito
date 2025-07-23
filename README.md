# 🏦 Comparador de Crédito Habitação - Web Application

Uma aplicação web moderna para comparar ofertas de crédito habitação de diferentes bancos, convertida a partir dos scripts Python originais.

## ✨ Funcionalidades

### 🏦 Comparação de Bancos
- Compare ofertas de crédito de múltiplos bancos
- Análise anual detalhada (1, 2, 3, 5, 10, 20, 40 anos)
- Identificação automática da melhor e pior opção
- Cálculo de diferenças totais entre ofertas

### 📊 Mapa de Dívida
- Gráficos interativos mostrando a evolução da dívida
- Visualização de prestações mensais ao longo do tempo
- Capital em dívida por ano
- Seleção de bancos para comparação visual

### 📝 Gestão de Dados
- Adicionar novos bancos com formulário completo
- Editar dados de bancos existentes
- Remover bancos
- Exportar dados para formato JSON

### 🎨 Interface Moderna
- Design responsivo (desktop e mobile)
- Interface limpa e intuitiva
- Gráficos interativos com Recharts
- Cálculos em tempo real

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

A aplicação estará disponível em **http://localhost:3000**

### Outros Comandos
```bash
# Construir para produção
npm run build

# Executar testes
npm test

# Ejetar do Create React App (não recomendado)
npm run eject
```

## 📋 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── BankForm.tsx    # Formulário para dados de bancos
│   ├── ComparisonTable.tsx  # Tabela de comparação
│   └── DebtMapChart.tsx     # Gráficos de evolução da dívida
├── data/
│   └── banksData.ts    # Dados iniciais dos bancos
├── types/
│   └── index.ts        # Definições de tipos TypeScript
├── utils/
│   └── calculations.ts # Lógica de cálculos financeiros
├── App.tsx             # Componente principal
├── index.tsx           # Ponto de entrada
└── index.css           # Estilos globais
```

## 💰 Campos de Dados dos Bancos

Cada banco inclui os seguintes campos:

- **Valor do Empréstimo**: Montante total do crédito
- **Tempo do Empréstimo**: Duração em anos
- **Período Fixo**: Anos com taxa fixa
- **Taxa Fixa**: Percentagem da taxa fixa
- **Spread**: Margem sobre Euribor
- **Euribor**: Taxa de referência
- **Prémios de Entrada**: Valor recebido no início
- **Comissões Iniciais**: Custos iniciais
- **Comissões Mensais**:
  - Seguro de Vida
  - Seguro Multiriscos
  - Manutenção de Conta
  - Outros
- **Devolução do Spread**: Se aplica devolução mensal

## 🔧 Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilos
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones
- **Create React App** - Configuração inicial

## 📊 Cálculos Financeiros

A aplicação replica exatamente a lógica dos scripts Python originais:

1. **Cálculo de Prestação**: Fórmula de amortização com juros compostos
2. **Período Fixo/Variável**: Transição automática entre taxas
3. **Devolução do Spread**: Cálculo mensal quando aplicável
4. **Comissões**: Acumulação de todos os custos mensais
5. **CashOut**: Total pago (bruto e líquido)

## 🎯 Comparação com Versão Python

| Funcionalidade | Python | Web App |
|----------------|--------|---------|
| Comparação de bancos | ✅ | ✅ |
| Mapa de dívida | ✅ | ✅ |
| Gestão de dados | ✅ | ✅ |
| Interface gráfica | Tkinter | React + Tailwind |
| Gráficos | ❌ | ✅ Recharts |
| Responsivo | ❌ | ✅ |
| Exportação | TXT | JSON |
| Cálculos | Decimal | Number (precisão 12) |

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se encontrar algum problema ou tiver sugestões, por favor abra uma issue no repositório.
