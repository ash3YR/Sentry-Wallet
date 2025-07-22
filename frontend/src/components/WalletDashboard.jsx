
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, Send, UserPlus } from 'lucide-react';
import WalletBalance from './WalletBalance';
import SendTransaction from './SendTransaction';
import NomineeManager from './NomineeManager';
import { supabase } from '../utils/wallet';

const WalletDashboard = ({ wallet }) => {
  const [transactionCount, setTransactionCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  if (!wallet) {
    return null;
  }

  const handleTransactionSuccess = () => {
    setTransactionCount(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <motion.div
        className="neumorphic rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/20 rounded-3xl flex items-center justify-center">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-accent mb-2">Your Wallet</h1>
          <p className="text-gray-600 font-mono text-sm break-all bg-gray-100 rounded-lg p-2">
            {wallet.address}
          </p>
        </div>

        {/* Balance Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-accent mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Balance
          </h2>
          <WalletBalance wallet={wallet} transactionCount={transactionCount} />
        </div>

        {/* Send Transaction Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-accent mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2" />
            Send Transaction
          </h2>
          <SendTransaction wallet={wallet} onTransactionSuccess={handleTransactionSuccess} />
        </div>

        {/* Nominee Manager Section (on-chain) */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-accent mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Nominee Manager (On-chain)
          </h2>
          <NomineeManager user={user} />
        </div>
      </motion.div>
    </div>
  );
};

export default WalletDashboard;
