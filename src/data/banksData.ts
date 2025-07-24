import { BanksData } from '../types';

export const initialBanksData: BanksData = {
  "ABanca": {
    "periodo_fixa": 1,
    "taxa_fixa": 2.0,
    "euribor": 2.081,
    "spread": 0.5,
    "valor_emprestimo": 200000.0,
    "tempo_emprestimo": 40,
    "premios_entrada": 350.0,
    "comissoes_iniciais": 1695.4,
    "seguro_vida": 17.56,
    "seguro_multiriscos": 9.6,
    "manutencao_conta": 5.2,
    "outros": 0.0,
    "devolucao_spread": false,
    "amortizacoes": []
  },
  "Millenium": {
    "periodo_fixa": 2,
    "taxa_fixa": 2.9,
    "euribor": 2.081,
    "spread": 0.6,
    "valor_emprestimo": 200000.0,
    "tempo_emprestimo": 40,
    "premios_entrada": 3333.0,
    "comissoes_iniciais": 1701.4,
    "seguro_vida": 22.98,
    "seguro_multiriscos": 22.59,
    "manutencao_conta": 5.2,
    "outros": 0.0,
    "devolucao_spread": false,
    "amortizacoes": []
  },
  "Montepio": {
    "periodo_fixa": 2,
    "taxa_fixa": 3,
    "euribor": 2.081,
    "spread": 0.8,
    "valor_emprestimo": 200000.0,
    "tempo_emprestimo": 40,
    "premios_entrada": 2600.0,
    "comissoes_iniciais": 2251.17,
    "seguro_vida": 16.61,
    "seguro_multiriscos": 17.79,
    "manutencao_conta": 4.6,
    "outros": 0.0,
    "devolucao_spread": true,
    "amortizacoes": []
  },
};
