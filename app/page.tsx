'use client';

import { useState, useEffect } from 'react';

export default function BudgetAssistant() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [expenses, setExpenses] = useState<Array<{ id: number; description: string; amount: number; date: string }>>([]);

  useEffect(() => {
    const saved = localStorage.getItem('my_expenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    }
  }, []);

  const saveExpenses = (newExpenses: typeof expenses) => {
    setExpenses(newExpenses);
    localStorage.setItem('my_expenses', JSON.stringify(newExpenses));
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট করে না। Google Chrome ব্যবহার করুন।');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(transcript);

      const foundNumbers = transcript.match(/\d+/g);
      if (foundNumbers) {
        setAmount(foundNumbers.join(''));
      }
    };

    recognition.start();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newExpense = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString('bn-BD'),
    };

    const updated = [newExpense, ...expenses];
    saveExpenses(updated);

    setDescription('');
    setAmount('');
  };

  const handleDelete = (id: number) => {
    const updated = expenses.filter((item) => item.id !== id);
    saveExpenses(updated);
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Personal Finance Assistant</h1>
          <p className="text-emerald-100 text-sm mt-1">ভয়েস বা লিখে খরচের হিসাব রাখুন</p>
          <div className="mt-4 bg-emerald-700/50 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-xs uppercase tracking-wider text-emerald-200">মোট খরচ</span>
            <div className="text-3xl font-extrabold mt-1">৳ {totalExpense.toLocaleString()}</div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddExpense} className="p-6 space-y-4">
          
          {/* Voice Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={startListening}
              className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              🎤 {isListening ? 'শুনছি... কথা বলুন' : 'ভয়েস দিয়ে খরচ বলুন (বাংলা)'}
            </button>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-gray-400 font-medium uppercase absolute">অথবা টাইপ করুন</span>
          </div>

          {/* Text Description Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">খরচের বিষয়</label>
            <input
              type="text"
              placeholder="যেমন: চাল কেনা, রিকশা ভাড়া"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">টাকার পরিমাণ (৳)</label>
            <input
              type="number"
              placeholder="যেমন: ৫০০"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
          >
            খরচ যোগ করুন
          </button>
        </form>

        {/* Expense List */}
        <div className="px-6 pb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">সাম্প্রতিক খরচসমূহ</h2>
          {expenses.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">এখনো কোনো খরচ যুক্ত করা হয়নি।</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {expenses.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.description}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">৳ {item.amount}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}