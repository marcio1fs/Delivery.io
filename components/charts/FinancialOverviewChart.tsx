
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { financialData } from '../../data';

const FinancialOverviewChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={financialData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis dataKey="month" tick={{ fill: '#A0AEC0' }} />
        <YAxis tick={{ fill: '#A0AEC0' }} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A202C',
            border: '1px solid #2D3748',
            color: '#E2E8F0',
          }}
          cursor={{ fill: 'rgba(74, 85, 104, 0.4)' }}
        />
        <Legend wrapperStyle={{ color: '#A0AEC0' }} />
        <Bar dataKey="revenue" stackId="a" fill="#3182CE" name="Receita" />
        <Bar dataKey="payouts" stackId="a" fill="#E53E3E" name="Pagamentos" />
        <Bar dataKey="profit" fill="#38A169" name="Lucro" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FinancialOverviewChart;