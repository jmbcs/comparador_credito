import { BarChart3, Building2, Calendar, Filter, Smartphone } from 'lucide-react';
import React, { useState } from 'react';
import { DebtMapEntry } from '../types';

interface YearlyCalculationsTableProps {
    data: DebtMapEntry[];
    selectedBanks: string[];
}

export const YearlyCalculationsTable: React.FC<YearlyCalculationsTableProps> = ({
    data,
    selectedBanks
}) => {
    const [activeBankTab, setActiveBankTab] = useState<string>('todos');
    const [selectedYear, setSelectedYear] = useState<string>('todos');
    const [viewMode, setViewMode] = useState<'years' | 'months'>('years');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    // Filter data for selected banks
    const allData = data.filter(entry => selectedBanks.includes(entry.Banco));

    // Get yearly data (only for year view)
    const yearlyData = allData
        .filter(entry => entry.Mês % 12 === 0)
        .map(entry => ({
            ...entry,
            Ano: entry.Ano
        }));

    // Get available years
    const years = Array.from(new Set(yearlyData.map(d => d.Ano))).sort((a: number, b: number) => a - b);

    if (allData.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado disponível</h3>
                <p className="text-gray-600">Adicione bancos para visualizar o mapa de dívida</p>
            </div>
        );
    }

    // Filter data by selected year (for year view)
    const yearFilteredData = selectedYear === 'todos'
        ? yearlyData
        : yearlyData.filter(d => d.Ano === parseInt(selectedYear));

    const renderTable = (bankFilter: string | null) => {
        let tableData: any[] = [];

        if (viewMode === 'years') {
            // Year view logic
            tableData = bankFilter === 'todos'
                ? selectedBanks.map(bankName => {
                    const bankYearData = selectedYear === 'todos'
                        ? yearFilteredData.filter((d: any) => d.Banco === bankName)
                        : yearFilteredData.filter((d: any) => d.Banco === bankName && d.Ano === parseInt(selectedYear));
                    return bankYearData;
                }).flat().filter(Boolean)
                : yearFilteredData.filter((d: any) => d.Banco === bankFilter);
        } else {
            // Month view logic - show all months or filtered by year
            let monthData = bankFilter === 'todos'
                ? allData
                : allData.filter((d: any) => d.Banco === bankFilter);

            // Apply year filter if selected
            if (selectedYear !== 'todos') {
                monthData = monthData.filter((d: any) => d.Ano === parseInt(selectedYear));
            }

            tableData = monthData;
        }

        if (tableData.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <Filter className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm">Nenhum dado disponível para esta seleção</p>
                </div>
            );
        }

        // Group data based on view mode
        let groupedData: any[] = [];

        if (viewMode === 'years') {
            // Group by year if showing all years
            groupedData = selectedYear === 'todos'
                ? years.map(year => ({
                    year,
                    data: tableData.filter((d: any) => d.Ano === year)
                }))
                : [{ year: parseInt(selectedYear), data: tableData }];
        } else {
            // Group by year for month view (to organize months by year)
            if (selectedYear === 'todos') {
                // Show all years grouped
                const monthYears = Array.from(new Set(tableData.map((d: any) => d.Ano))).sort((a: number, b: number) => a - b);
                groupedData = monthYears.map(year => ({
                    year,
                    data: tableData.filter((d: any) => d.Ano === year).sort((a: any, b: any) => a.Mês - b.Mês)
                }));
            } else {
                // Show only selected year
                groupedData = [{
                    year: parseInt(selectedYear),
                    data: tableData.sort((a: any, b: any) => a.Mês - b.Mês)
                }];
            }
        }

        return (
            <div className="space-y-6">
                {groupedData.map(({ year, data }) => (
                    <div key={year} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                                {viewMode === 'years' ? `${year}º Ano` : `${year}º Ano`}
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Banco</th>
                                        {viewMode === 'months' && (
                                            <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Mês</th>
                                        )}
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Prestação</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Total</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Capital</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">CashOut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.map((row: any, index: number) => (
                                        <tr key={`${row.Banco}-${row.Ano}-${row.Mês || ''}`} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                        <Building2 className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{row.Banco}</span>
                                                </div>
                                            </td>
                                            {viewMode === 'months' && (
                                                <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">
                                                    {row.Mês}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(row["Prestação (€)"])}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(row["Total Mensal (€)"])}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(row["Capital em Dívida (€)"])}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                                {formatCurrency(row["CashOut Líquido (€)"])}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Professional Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Mapa de Dívida</h2>
                            <p className="text-sm text-gray-600">Análise detalhada da evolução do empréstimo</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center text-sm text-gray-500">
                        <Smartphone className="h-4 w-4 mr-2" />
                        {selectedBanks.length} banco{selectedBanks.length !== 1 ? 's' : ''} selecionado{selectedBanks.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* View Mode */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Modo de Visualização</label>
                        <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                            <button
                                onClick={() => setViewMode('years')}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'years'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Anos
                            </button>
                            <button
                                onClick={() => setViewMode('months')}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'months'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Meses
                            </button>
                        </div>
                    </div>

                    {/* Year Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Filtrar por Ano</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="todos">Todos os anos</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}º ano</option>
                            ))}
                        </select>
                    </div>

                    {/* Bank Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Filtrar por Banco</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveBankTab('todos')}
                                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${activeBankTab === 'todos'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Todos
                            </button>
                            {selectedBanks.map(bankName => (
                                <button
                                    key={bankName}
                                    onClick={() => setActiveBankTab(bankName)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${activeBankTab === bankName
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {bankName}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            {renderTable(activeBankTab)}
        </div>
    );
};
