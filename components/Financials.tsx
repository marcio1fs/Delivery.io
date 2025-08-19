
import React from 'react';
import Card from './ui/Card';
import { establishmentProfile } from '../data';
import { Transaction, TransactionType } from '../types';
import CreditCardIcon from './icons/CreditCardIcon';

const Financials: React.FC = () => {
  const { creditBalance, transactionHistory } = establishmentProfile;

  const getTransactionColor = (type: TransactionType) => {
      switch(type) {
          case TransactionType.Credit: return 'text-green-400';
          case TransactionType.Debit: return 'text-red-400';
          case TransactionType.Refund: return 'text-yellow-400';
          default: return 'text-gray-400';
      }
  };

  const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50">
      <td className="p-4 font-mono text-sm text-gray-400">{tx.id}</td>
      <td className="p-4">{tx.description}</td>
      <td className="p-4">{tx.timestamp}</td>
      <td className={`p-4 font-bold text-right ${getTransactionColor(tx.type)}`}>
        {tx.type === TransactionType.Debit ? '-' : '+'}
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(tx.amount))}
      </td>
    </tr>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Financeiro</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg flex items-center space-x-2">
          <CreditCardIcon className="w-5 h-5"/>
          <span>Recarregar Créditos</span>
        </button>
      </div>
      
      <Card className="text-center bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500">
        <p className="text-lg text-blue-200">Saldo de Crédito Atual</p>
        <p className="text-5xl font-bold tracking-tight text-white my-2">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(creditBalance)}
        </p>
      </Card>
      
      <Card>
        <h3 className="text-xl font-bold mb-4">Histórico de Transações</h3>
         <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Data</th>
                <th className="p-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactionHistory.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default Financials;