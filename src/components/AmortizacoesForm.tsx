import { Calendar, Euro, Info, Plus, Trash2, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { Amortizacao } from '../types';

interface AmortizacoesFormProps {
    amortizacoes: Amortizacao[];
    onAmortizacoesChange: (amortizacoes: Amortizacao[]) => void;
    tempoEmprestimo: number;
}

const AmortizacoesForm: React.FC<AmortizacoesFormProps> = ({
    amortizacoes,
    onAmortizacoesChange,
    tempoEmprestimo
}) => {
    const [novaPrestacao, setNovaPrestacao] = useState<number>(1);
    const [novoValor, setNovoValor] = useState<number>(0);

    const adicionarAmortizacao = () => {
        if (novaPrestacao > 0 && novaPrestacao <= tempoEmprestimo * 12 && novoValor > 0) {
            const novaAmortizacao: Amortizacao = {
                prestacao: novaPrestacao,
                valor: novoValor
            };

            const amortizacoesAtualizadas = [...amortizacoes, novaAmortizacao]
                .sort((a, b) => a.prestacao - b.prestacao);

            onAmortizacoesChange(amortizacoesAtualizadas);
            setNovaPrestacao(1);
            setNovoValor(0);
        }
    };

    const removerAmortizacao = (index: number) => {
        const amortizacoesAtualizadas = amortizacoes.filter((_, i) => i !== index);
        onAmortizacoesChange(amortizacoesAtualizadas);
    };

    const totalAmortizacoes = amortizacoes.reduce((total, a) => total + a.valor, 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Formulário de Adição */}
            <div className="bg-white/80 rounded-xl p-6 border border-orange-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-orange-500 rounded-lg">
                        <Plus className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-orange-900">Adicionar Amortização</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Prestação
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                min="1"
                                max={tempoEmprestimo * 12}
                                value={novaPrestacao}
                                onChange={(e) => setNovaPrestacao(Number(e.target.value))}
                                className="input pl-10 h-12"
                                placeholder="Ex: 38"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {Math.ceil(novaPrestacao / 12)}º ano, {novaPrestacao % 12 || 12}º mês
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Valor (€)
                        </label>
                        <div className="relative">
                            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={novoValor}
                                onChange={(e) => setNovoValor(Number(e.target.value))}
                                className="input pl-10 h-12"
                                placeholder="Ex: 10000"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={adicionarAmortizacao}
                            disabled={novaPrestacao <= 0 || novaPrestacao > tempoEmprestimo * 12 || novoValor <= 0}
                            className="btn-primary w-full h-12 flex items-center justify-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Adicionar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de Amortizações */}
            {amortizacoes.length > 0 && (
                <div className="bg-white/80 rounded-xl p-6 border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-green-900">Amortizações Configuradas</h4>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-bold text-lg text-green-700">{formatCurrency(totalAmortizacoes)}</p>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto form-scroll">
                        {amortizacoes.map((amortizacao, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-all duration-200">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <Calendar className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            Prestação {amortizacao.prestacao}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {Math.ceil(amortizacao.prestacao / 12)}º ano, {amortizacao.prestacao % 12 || 12}º mês
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-green-700">
                                            {formatCurrency(amortizacao.valor)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removerAmortizacao(index)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estado Vazio */}
            {amortizacoes.length === 0 && (
                <div className="bg-white/80 rounded-xl p-8 border border-orange-200 shadow-sm text-center">
                    <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma amortização configurada</h4>
                    <p className="text-gray-600 mb-4">Adicione amortizações antecipadas para reduzir o capital em dívida</p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                        <div className="flex items-start space-x-3">
                            <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-orange-800">
                                <p className="font-medium mb-2">Benefícios das amortizações:</p>
                                <ul className="space-y-1 text-left">
                                    <li>• Reduzem o capital em dívida</li>
                                    <li>• Diminuem o total de juros pagos</li>
                                    <li>• Podem reduzir o prazo do empréstimo</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Informações */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                        <Info className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-2">Como funcionam as amortizações antecipadas:</p>
                        <ul className="space-y-1">
                            <li>• <strong>Timing:</strong> Aplicadas na prestação especificada</li>
                            <li>• <strong>Efeito:</strong> Reduzem o capital em dívida imediatamente</li>
                            <li>• <strong>Recálculo:</strong> As prestações seguintes são recalculadas automaticamente</li>
                            <li>• <strong>Economia:</strong> Reduzem significativamente o total de juros pagos</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AmortizacoesForm;
