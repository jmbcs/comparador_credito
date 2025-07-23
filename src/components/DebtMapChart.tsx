import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DebtMapEntry } from '../types';

interface DebtMapChartProps {
    data: DebtMapEntry[];
    selectedBanks: string[];
}

export const DebtMapChart: React.FC<DebtMapChartProps> = ({ data, selectedBanks }) => {
    // Filter data for selected banks and only show yearly data
    const yearlyData = data
        .filter(entry => selectedBanks.includes(entry.Banco) && entry.Mês % 12 === 0)
        .map(entry => ({
            ...entry,
            Ano: entry.Ano
        }));

    // Group by year and bank
    const chartData: any[] = [];
    const years = Array.from(new Set(yearlyData.map(d => d.Ano))).sort((a: number, b: number) => a - b);

    years.forEach(year => {
        const yearData: any = { Ano: year };
        selectedBanks.forEach(bank => {
            const bankData = yearlyData.find(d => d.Banco === bank && d.Ano === year);
            if (bankData) {
                yearData[`${bank}_Capital`] = bankData["Capital em Dívida (€)"];
                yearData[`${bank}_Comissoes`] = bankData["Comissões Acumuladas (€)"];
            }
        });
        chartData.push(yearData);
    });

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

    const formatCurrency = (value: any) => {
        if (typeof value === 'number') {
            return new Intl.NumberFormat('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            }).format(value);
        }
        return value;
    };

    return (
        <div className="space-y-8">
            {/* Capital em Dívida Chart */}
            <div className="card">
                <h3 className="text-xl font-semibold mb-6">📊 Evolução do Capital em Dívida</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="Ano"
                            label={{ value: 'Ano', position: 'insideBottom', offset: -10 }}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            label={{ value: 'Capital em Dívida (€)', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value: any) => [formatCurrency(value), 'Capital em Dívida']}
                            labelFormatter={(label) => `Ano ${label}`}
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Legend />
                        {selectedBanks.map((bank, index) => (
                            <Line
                                key={`${bank}_Capital`}
                                type="monotone"
                                dataKey={`${bank}_Capital`}
                                name={`${bank} - Capital`}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                                dot={{ r: 5, strokeWidth: 2 }}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Comissões Acumuladas Chart */}
            <div className="card">
                <h3 className="text-xl font-semibold mb-6">📈 Evolução das Comissões Acumuladas</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="Ano"
                            label={{ value: 'Ano', position: 'insideBottom', offset: -10 }}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            label={{ value: 'Comissões Acumuladas (€)', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value: any) => [formatCurrency(value), 'Comissões Acumuladas']}
                            labelFormatter={(label) => `Ano ${label}`}
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Legend />
                        {selectedBanks.map((bank, index) => (
                            <Line
                                key={`${bank}_Comissoes`}
                                type="monotone"
                                dataKey={`${bank}_Comissoes`}
                                name={`${bank} - Comissões`}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                                dot={{ r: 5, strokeWidth: 2 }}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
