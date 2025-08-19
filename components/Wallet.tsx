
import React from 'react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { RiderProfile, Transaction, TransactionType } from '../types';

interface WalletProps {
  riderProfile: RiderProfile;
  setRiderProfile: React.Dispatch<React.SetStateAction<RiderProfile>>;
}

const Wallet: React.FC<WalletProps> = ({ riderProfile, setRiderProfile }) => {
  const handleEarlyWithdrawal = () => {
    const withdrawalAmount = riderProfile.balance;
    if (withdrawalAmount <= 0) {
        alert("Saldo insuficiente para resgate.");
        return;
    }
    const fee = withdrawalAmount * 0.05;
    const netAmount = withdrawalAmount - fee;

    if (confirm(`Resgatar R$ ${withdrawalAmount.toFixed(2)}? Uma taxa de 5% (R$ ${fee.toFixed(2)}) será aplicada. Você receberá R$ ${netAmount.toFixed(2)}.`)) {
        const newTransaction: Transaction = {
            id: `TRN${Date.now()}`,
            type: TransactionType.EarlyWithdrawal,
            amount: -withdrawalAmount,
            timestamp: new Date().toLocaleDateString('pt-BR'),
            description: `Resgate antecipado com taxa de R$ ${fee.toFixed(2)}`
        };
        
        setRiderProfile(prev => ({
            ...prev,
            balance: 0,
            transactionHistory: [newTransaction, ...prev.transactionHistory]
        }));
    }
  };

  const getTransactionColor = (type: TransactionType) => {
      switch(type) {
          case TransactionType.Earning: return 'text-green-400';
          case TransactionType.Withdrawal: return 'text-red-400';
          case TransactionType.EarlyWithdrawal: return 'text-yellow-400';
          default: return 'text-gray-400';
      }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Minha Carteira</h2>
        <p className="text-gray-400">Gerencie seus ganhos e saques.</p>
      </div>
      
      <Card className="text-center bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500">
        <p className="text-lg text-blue-200">Saldo Atual</p>
        <p className="text-5xl font-bold tracking-tight text-white my-2">
            R$ {riderProfile.balance.toFixed(2).replace('.', ',')}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">
            Sacar Saldo
          </button>
          <button onClick={handleEarlyWithdrawal} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition-colors">
            Resgate Antecipado
          </button>
      </div>
      
      <Card>
        <h3 className="text-xl font-bold mb-4">Histórico de Transações</h3>
        <ul className="space-y-4">
          {riderProfile.transactionHistory.map(tx => (
            <li key={tx.id} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{tx.description}</p>
                <p className="text-sm text-gray-400">{tx.timestamp}</p>
              </div>
              <p className={`font-bold text-lg ${getTransactionColor(tx.type)}`}>
                  {tx.amount > 0 ? `+R$ ${tx.amount.toFixed(2)}` : `-R$ ${Math.abs(tx.amount).toFixed(2)}`}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Wallet;
