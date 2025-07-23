import { AlertCircle, Building2, Calculator, CheckCircle, ChevronLeft, ChevronRight, CreditCard, Euro, Save, TrendingUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BankData } from '../types';
import AmortizacoesForm from './AmortizacoesForm';

interface BankFormProps {
    bankName: string;
    data: BankData;
    onSave: (bankName: string, data: BankData) => void;
    onCancel: () => void;
    isEditing: boolean;
}

export const BankForm: React.FC<BankFormProps> = ({ bankName, data, onSave, onCancel, isEditing }) => {
    const [formData, setFormData] = useState<BankData>(data);
    const [newBankName, setNewBankName] = useState(bankName);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        if (newBankName !== bankName) {
            setFormData(data);
            setNewBankName(bankName);
            setErrors({});
        }
    }, [bankName, data, newBankName]);

    // Bloquear scroll do body quando o modal estiver aberto
    useEffect(() => {
        document.body.classList.add('scroll-locked');

        return () => {
            document.body.classList.remove('scroll-locked');
        };
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!newBankName.trim()) {
            newErrors.bankName = 'Nome do banco é obrigatório';
        }

        if (formData.valor_emprestimo <= 0) {
            newErrors.valor_emprestimo = 'Valor do empréstimo deve ser maior que 0';
        }

        if (formData.tempo_emprestimo <= 0) {
            newErrors.tempo_emprestimo = 'Tempo do empréstimo deve ser maior que 0';
        }

        if (formData.taxa_fixa <= 0) {
            newErrors.taxa_fixa = 'Taxa fixa deve ser maior que 0';
        }

        if (formData.seguro_vida < 0) {
            newErrors.seguro_vida = 'Seguro de vida não pode ser negativo';
        }

        if (formData.seguro_multiriscos < 0) {
            newErrors.seguro_multiriscos = 'Seguro multiriscos não pode ser negativo';
        }

        if (formData.manutencao_conta < 0) {
            newErrors.manutencao_conta = 'Manutenção de conta não pode ser negativa';
        }

        if (formData.premios_entrada < 0) {
            newErrors.premios_entrada = 'Prémios de entrada não podem ser negativos';
        }

        if (formData.comissoes_iniciais < 0) {
            newErrors.comissoes_iniciais = 'Comissões iniciais não podem ser negativas';
        }

        if (formData.outros < 0) {
            newErrors.outros = 'Outros custos não podem ser negativos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSave(newBankName, formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof BankData, value: number | boolean | any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(3)}%`;
    };

    // Função para calcular prestação mensal
    const calcularPrestacao = (capital: number, taxaAnual: number, nMeses: number): number => {
        if (taxaAnual === 0 || nMeses === 0) return 0;
        const taxaMensal = taxaAnual / 12 / 100;
        return (capital * taxaMensal * Math.pow(1 + taxaMensal, nMeses)) / (Math.pow(1 + taxaMensal, nMeses) - 1);
    };

    // Função para calcular capital em dívida após período fixo
    const calcularCapitalRestante = (capitalInicial: number, taxaAnual: number, nMeses: number): number => {
        if (taxaAnual === 0 || nMeses === 0) return capitalInicial;

        const taxaMensal = taxaAnual / 12 / 100;
        const prestacao = calcularPrestacao(capitalInicial, taxaAnual, formData.tempo_emprestimo * 12);

        // Calcular capital restante após nMeses de pagamentos
        let capitalRestante = capitalInicial;
        for (let mes = 1; mes <= nMeses; mes++) {
            const juros = capitalRestante * taxaMensal;
            const amortizacao = prestacao - juros;
            capitalRestante = capitalRestante - amortizacao;
        }

        return Math.max(0, capitalRestante);
    };

    // Função para obter prestação usando mapa de dívida
    const obterPrestacaoMapaDivida = (data: BankData, mes: number): number => {
        const { gerarMapaDivida } = require('../utils/calculations');
        const debtMap = gerarMapaDivida(data, 'temp');
        const entry = debtMap.find((entry: any) => entry.Mês === mes);
        return entry ? entry["Prestação (€)"] : 0;
    };

    const totalMonthlyCosts = formData.seguro_vida + formData.seguro_multiriscos + formData.manutencao_conta + formData.outros;

    const steps = [
        { id: 1, title: 'Informações Básicas', icon: Building2, color: 'blue' },
        { id: 2, title: 'Taxas e Custos', icon: Calculator, color: 'green' },
        { id: 3, title: 'Outflow Inicial', icon: CreditCard, color: 'purple' },
        { id: 4, title: 'Amortizações', icon: TrendingUp, color: 'orange' },
        { id: 5, title: 'Resumo', icon: CheckCircle, color: 'emerald' }
    ];

    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="form-group">
                                    <label className="form-label">
                                        Nome do Banco *
                                    </label>
                                    <input
                                        type="text"
                                        value={newBankName}
                                        onChange={(e) => {
                                            setNewBankName(e.target.value);
                                            if (errors.bankName) setErrors(prev => ({ ...prev, bankName: '' }));
                                        }}
                                        className={`input ${errors.bankName ? 'input-error' : ''}`}
                                        placeholder="Ex: Banco de Portugal"
                                    />
                                    {errors.bankName && (
                                        <p className="form-error">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.bankName}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Valor do Empréstimo (€) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.valor_emprestimo}
                                        onChange={(e) => handleInputChange('valor_emprestimo', parseFloat(e.target.value) || 0)}
                                        className={`input ${errors.valor_emprestimo ? 'input-error' : ''}`}
                                        placeholder="Ex: 200000"
                                        min="0"
                                        step="1000"
                                    />
                                    {errors.valor_emprestimo && (
                                        <p className="form-error">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.valor_emprestimo}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Prazo (anos) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.tempo_emprestimo}
                                        onChange={(e) => handleInputChange('tempo_emprestimo', parseInt(e.target.value) || 0)}
                                        className={`input ${errors.tempo_emprestimo ? 'input-error' : ''}`}
                                        placeholder="Ex: 30"
                                        min="1"
                                        max="50"
                                    />
                                    {errors.tempo_emprestimo && (
                                        <p className="form-error">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.tempo_emprestimo}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Calculator className="h-5 w-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Taxas e Custos Mensais</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Taxas */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800 text-base">Taxas</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Taxa Fixa (%) *
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.taxa_fixa}
                                                onChange={(e) => handleInputChange('taxa_fixa', parseFloat(e.target.value) || 0)}
                                                className={`input ${errors.taxa_fixa ? 'input-error' : ''}`}
                                                placeholder="Ex: 3.5"
                                                min="0"
                                                max="20"
                                                step="0.001"
                                            />
                                            {errors.taxa_fixa && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.taxa_fixa}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Período Fixo (anos)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.periodo_fixa}
                                                onChange={(e) => handleInputChange('periodo_fixa', parseInt(e.target.value) || 0)}
                                                className="input"
                                                placeholder="Ex: 2"
                                                min="0"
                                                max="50"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Euribor (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.euribor}
                                                onChange={(e) => handleInputChange('euribor', parseFloat(e.target.value) || 0)}
                                                className="input"
                                                placeholder="Ex: 2.081"
                                                min="0"
                                                max="20"
                                                step="0.001"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Spread (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.spread}
                                                onChange={(e) => handleInputChange('spread', parseFloat(e.target.value) || 0)}
                                                className="input"
                                                placeholder="Ex: 0.5"
                                                min="0"
                                                max="10"
                                                step="0.001"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Custos Mensais */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800 text-base">Custos Mensais</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Seguro de Vida (€/mês)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.seguro_vida}
                                                onChange={(e) => handleInputChange('seguro_vida', parseFloat(e.target.value) || 0)}
                                                className={`input ${errors.seguro_vida ? 'input-error' : ''}`}
                                                placeholder="Ex: 5.00"
                                                min="0"
                                                step="0.01"
                                            />
                                            {errors.seguro_vida && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.seguro_vida}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Seguro Multirriscos (€/mês)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.seguro_multiriscos}
                                                onChange={(e) => handleInputChange('seguro_multiriscos', parseFloat(e.target.value) || 0)}
                                                className={`input ${errors.seguro_multiriscos ? 'input-error' : ''}`}
                                                placeholder="Ex: 3.50"
                                                min="0"
                                                step="0.01"
                                            />
                                            {errors.seguro_multiriscos && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.seguro_multiriscos}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Manutenção de Conta (€/mês)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.manutencao_conta}
                                                onChange={(e) => handleInputChange('manutencao_conta', parseFloat(e.target.value) || 0)}
                                                className={`input ${errors.manutencao_conta ? 'input-error' : ''}`}
                                                placeholder="Ex: 10.00"
                                                min="0"
                                                step="0.01"
                                            />
                                            {errors.manutencao_conta && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.manutencao_conta}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Outros Custos (€/mês)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.outros}
                                                onChange={(e) => handleInputChange('outros', parseFloat(e.target.value) || 0)}
                                                className={`input ${errors.outros ? 'input-error' : ''}`}
                                                placeholder="Ex: 5.00"
                                                min="0"
                                                step="0.01"
                                            />
                                            {errors.outros && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.outros}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <input
                                            type="checkbox"
                                            id="devolucao_spread"
                                            checked={formData.devolucao_spread}
                                            onChange={(e) => handleInputChange('devolucao_spread', e.target.checked)}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
                                        />
                                        <label htmlFor="devolucao_spread" className="text-sm font-medium text-gray-700">
                                            Devolução do Spread
                                        </label>
                                    </div>
                                </div>

                                {/* Resumo dos Custos Mensais */}
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Total Custos Mensais:</span>
                                        <span className="font-semibold text-lg text-green-700">{formatCurrency(totalMonthlyCosts)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Outflow Inicial</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">
                                            Prémios de Entrada (€)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.premios_entrada}
                                            onChange={(e) => handleInputChange('premios_entrada', parseFloat(e.target.value) || 0)}
                                            className={`input ${errors.premios_entrada ? 'input-error' : ''}`}
                                            placeholder="Ex: 200.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors.premios_entrada && (
                                            <p className="form-error">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.premios_entrada}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Comissões Iniciais (€)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.comissoes_iniciais}
                                            onChange={(e) => handleInputChange('comissoes_iniciais', parseFloat(e.target.value) || 0)}
                                            className={`input ${errors.comissoes_iniciais ? 'input-error' : ''}`}
                                            placeholder="Ex: 300.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors.comissoes_iniciais && (
                                            <p className="form-error">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.comissoes_iniciais}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Resumo dos Custos Iniciais */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-sm font-medium text-gray-700">Prémios de Entrada:</span>
                                        <span className="font-semibold text-green-700">+{formatCurrency(formData.premios_entrada)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                                        <span className="text-sm font-medium text-gray-700">Comissões Iniciais:</span>
                                        <span className="font-semibold text-red-700">-{formatCurrency(formData.comissoes_iniciais)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <span className="text-sm font-medium text-gray-700">Saldo Inicial:</span>
                                        <span className={`font-semibold text-lg ${formData.premios_entrada >= formData.comissoes_iniciais ? 'text-green-700' : 'text-red-700'}`}>
                                            {formData.premios_entrada >= formData.comissoes_iniciais ? '+' : ''}
                                            {formatCurrency(formData.premios_entrada - formData.comissoes_iniciais)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Amortizações Antecipadas</h3>
                            </div>

                            <AmortizacoesForm
                                amortizacoes={formData.amortizacoes || []}
                                onAmortizacoesChange={(amortizacoes) => handleInputChange('amortizacoes', amortizacoes)}
                                tempoEmprestimo={formData.tempo_emprestimo}
                            />
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        {/* Hidden input to ensure form submission works */}
                        <input type="hidden" value="summary" />
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Resumo da Proposta</h3>
                            </div>

                            {/* Informações Principais */}
                            <div className="data-grid mb-6">
                                <div className="data-item">
                                    <div className="data-label">Valor do Empréstimo</div>
                                    <div className="data-value">{formatCurrency(formData.valor_emprestimo)}</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Prazo Total</div>
                                    <div className="data-value">{formData.tempo_emprestimo} anos</div>
                                    <div className="text-xs text-gray-500">({formData.tempo_emprestimo * 12} meses)</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Taxa Fixa</div>
                                    <div className="data-value">{formatPercentage(formData.taxa_fixa)}</div>
                                    <div className="text-xs text-gray-500">Período: {formData.periodo_fixa} anos</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Custos Mensais</div>
                                    <div className="data-value">{formatCurrency(totalMonthlyCosts)}</div>
                                </div>
                            </div>

                            {/* Taxas e Spread */}
                            <div className="data-grid mb-6">
                                <div className="data-item">
                                    <div className="data-label">Euribor</div>
                                    <div className="data-value">{formatPercentage(formData.euribor)}</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Spread</div>
                                    <div className="data-value">{formatPercentage(formData.spread)}</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Devolução Spread</div>
                                    <div className="data-value">
                                        {formData.devolucao_spread ? 'Sim' : 'Não'}
                                    </div>
                                </div>
                            </div>

                            {/* Prestações por Período */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Prestação Período Fixo */}
                                <div className="data-card">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <Calculator className="h-4 w-4 text-blue-600" />
                                        <span>Prestação Período Fixo</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Taxa Aplicada:</span>
                                            <span className="font-medium text-blue-700">{formatPercentage(formData.taxa_fixa)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Duração:</span>
                                            <span className="font-medium">{formData.periodo_fixa} anos</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Prestação Mensal:</span>
                                            <span className="font-semibold text-lg text-blue-700">
                                                {formatCurrency(obterPrestacaoMapaDivida(formData, 1))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total com Custos:</span>
                                            <span className="font-semibold text-lg text-blue-700">
                                                {formatCurrency(obterPrestacaoMapaDivida(formData, 1) + totalMonthlyCosts)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Capital em Dívida (após {formData.periodo_fixa} anos):</span>
                                            <span className="font-medium text-blue-600">
                                                {formatCurrency(calcularCapitalRestante(formData.valor_emprestimo, formData.taxa_fixa, formData.periodo_fixa * 12))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Prestação Período Variável */}
                                <div className="data-card">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-purple-600" />
                                        <span>Prestação Período Variável</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Taxa Aplicada:</span>
                                            <span className="font-medium text-purple-700">{formatPercentage(formData.euribor + formData.spread)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Duração:</span>
                                            <span className="font-medium">
                                                {formData.periodo_fixa >= formData.tempo_emprestimo ?
                                                    'N/A (apenas período fixo)' :
                                                    `${formData.tempo_emprestimo - formData.periodo_fixa} anos`
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Prestação Mensal:</span>
                                            <span className="font-semibold text-lg text-purple-700">
                                                {formData.periodo_fixa >= formData.tempo_emprestimo ?
                                                    'N/A (apenas período fixo)' :
                                                    formatCurrency(obterPrestacaoMapaDivida(formData, formData.periodo_fixa * 12 + 1))
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total com Custos:</span>
                                            <span className="font-semibold text-lg text-purple-700">
                                                {formData.periodo_fixa >= formData.tempo_emprestimo ?
                                                    'N/A (apenas período fixo)' :
                                                    formatCurrency(obterPrestacaoMapaDivida(formData, formData.periodo_fixa * 12 + 1) + totalMonthlyCosts)
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Capital em Dívida (início período variável):</span>
                                            <span className="font-medium text-purple-600">
                                                {formData.periodo_fixa >= formData.tempo_emprestimo ?
                                                    'N/A (apenas período fixo)' :
                                                    formatCurrency(calcularCapitalRestante(formData.valor_emprestimo, formData.taxa_fixa, formData.periodo_fixa * 12))
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Custos Detalhados */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Custos Mensais Detalhados */}
                                <div className="data-card">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <CreditCard className="h-4 w-4 text-emerald-600" />
                                        <span>Custos Mensais Detalhados</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Seguro de Vida:</span>
                                            <span className="font-medium">{formatCurrency(formData.seguro_vida)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Seguro Multirriscos:</span>
                                            <span className="font-medium">{formatCurrency(formData.seguro_multiriscos)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Manutenção de Conta:</span>
                                            <span className="font-medium">{formatCurrency(formData.manutencao_conta)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Outros Custos:</span>
                                            <span className="font-medium">{formatCurrency(formData.outros)}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-semibold text-emerald-700">
                                            <span>Total Mensal:</span>
                                            <span>{formatCurrency(totalMonthlyCosts)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Custos Iniciais */}
                                <div className="data-card">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <Euro className="h-4 w-4 text-emerald-600" />
                                        <span>Outflow Inicial</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Prémios de Entrada:</span>
                                            <span className="font-medium text-green-700">+{formatCurrency(formData.premios_entrada)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Comissões Iniciais:</span>
                                            <span className="font-medium text-orange-700">-{formatCurrency(formData.comissoes_iniciais)}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-semibold">
                                            <span>Saldo Inicial:</span>
                                            <span className={`${formData.premios_entrada >= formData.comissoes_iniciais ? 'text-green-700' : 'text-red-700'}`}>
                                                {formData.premios_entrada >= formData.comissoes_iniciais ? '+' : ''}
                                                {formatCurrency(formData.premios_entrada - formData.comissoes_iniciais)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Amortizações Antecipadas */}
                            {(formData.amortizacoes && formData.amortizacoes.length > 0) && (
                                <div className="data-card mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        <span>Amortizações Antecipadas</span>
                                    </h4>
                                    <div className="data-grid">
                                        <div className="data-item">
                                            <div className="data-label">Total Amortizações</div>
                                            <div className="data-value">
                                                {formatCurrency(formData.amortizacoes.reduce((total, a) => total + a.valor, 0))}
                                            </div>
                                        </div>
                                        <div className="data-item">
                                            <div className="data-label">Número de Amortizações</div>
                                            <div className="data-value">
                                                {formData.amortizacoes.length}
                                            </div>
                                        </div>
                                        <div className="data-item">
                                            <div className="data-label">Média por Amortização</div>
                                            <div className="data-value">
                                                {formatCurrency(formData.amortizacoes.reduce((total, a) => total + a.valor, 0) / formData.amortizacoes.length)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resumo Final */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                    <span>Resumo Final da Proposta</span>
                                </h4>
                                <div className="data-grid text-sm">
                                    <div className="data-item">
                                        <div className="data-label">Valor Total</div>
                                        <div className="data-value">{formatCurrency(formData.valor_emprestimo)}</div>
                                    </div>
                                    <div className="data-item">
                                        <div className="data-label">Custos Anuais</div>
                                        <div className="data-value">{formatCurrency(totalMonthlyCosts * 12)}</div>
                                    </div>
                                    <div className="data-item">
                                        <div className="data-label">Custos Iniciais</div>
                                        <div className="data-value">{formatCurrency(formData.comissoes_iniciais)}</div>
                                    </div>
                                    <div className="data-item">
                                        <div className="data-label">Prémios de Entrada</div>
                                        <div className="data-value">{formatCurrency(formData.premios_entrada)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {isEditing ? 'Editar Banco' : 'Adicionar Novo Banco'}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {newBankName || 'Nome do banco'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                            aria-label="Fechar"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        onClick={() => setActiveStep(step.id)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${activeStep === step.id
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : activeStep > step.id
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}
                                    >
                                        <div className={`p-1 rounded ${activeStep === step.id
                                            ? 'bg-blue-600 text-white'
                                            : activeStep > step.id
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-400 text-white'
                                            }`}>
                                            {activeStep > step.id ? (
                                                <CheckCircle className="h-3 w-3" />
                                            ) : (
                                                <step.icon className="h-3 w-3" />
                                            )}
                                        </div>
                                        <span className="hidden sm:block">{step.title}</span>
                                    </button>
                                    {index < steps.length - 1 && (
                                        <div className={`w-8 h-0.5 mx-2 ${activeStep > step.id ? 'bg-green-300' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {renderStepContent()}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Passo {activeStep} de {steps.length}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="btn-secondary w-full sm:w-auto flex items-center justify-center space-x-2"
                                disabled={isSubmitting}
                            >
                                <X className="h-4 w-4" />
                                <span>Cancelar</span>
                            </button>

                            {activeStep > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(activeStep - 1)}
                                    className="btn-secondary w-full sm:w-auto flex items-center justify-center space-x-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Anterior</span>
                                </button>
                            )}

                            {activeStep < steps.length ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(activeStep + 1)}
                                    className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2"
                                >
                                    <span>Próximo</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-success w-full sm:w-auto flex items-center justify-center space-x-2"
                                    disabled={isSubmitting}
                                    onClick={() => handleSubmit({ preventDefault: () => { } } as any)}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>{isEditing ? 'Atualizar Banco' : 'Adicionar Banco'}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
