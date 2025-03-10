'use client';

import { useState, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';

// Suggested questions for kids to ask
const SUGGESTED_QUESTIONS = [
  "为什么天空是蓝色的？",
  "恐龙为什么会灭绝？",
  "为什么星星会眨眼睛？",
  "月亮为什么有时候是圆的，有时候是弯的？",
  "为什么下雨的时候会打雷？",
  "彩虹是怎么形成的？"
];

const Confetti = dynamic(() => Promise.resolve(() => {
  const confettiItems = Array.from({ length: 50 }, (_, i) => {
    // Use deterministic values based on index instead of random
    const size = 7 + (i % 8);
    const left = (i * 2) % 100;
    const animationDuration = 2 + (i % 3);
    const colorIndex = i % 7;
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
    ];
    
    return (
      <div 
        key={i}
        className={`absolute ${colors[colorIndex]} rounded-full opacity-70`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          top: '-5%',
          animation: `fall ${animationDuration}s linear forwards`,
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {confettiItems}
      </div>
    </div>
  );
}), { ssr: false });

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: string; content: any[] }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize confetti on mount
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: [{ type: 'text', text: input }]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      
      if (data.choices?.[0]?.message) {
        const assistantMessage = {
          role: 'assistant',
          content: [{ type: 'text', text: data.choices[0].message.content }]
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const askSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const formatMessage = (text: any) => {
    if (typeof text !== 'string') {
      // If text is not a string, try to get it from the content structure
      if (typeof text?.text === 'string') {
        text = text.text;
      } else {
        return <p className="mb-2">Error: Invalid message format</p>;
      }
    }
    return text.split('\n').map((line: string, i: number) => (
      <p key={i} className="mb-2">{line}</p>
    ));
  };

  const resetChat = () => {
    setMessages([]);
    setShowConfetti(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-blue-100 to-purple-100">
      {showConfetti && <Confetti />}
      
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-400 animate-breathing">
        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl animate-floating">🤖</span>
            <h1 className="text-3xl font-bold text-center rainbow-text">
              奇奇博士的科学乐园
            </h1>
            <span className="text-4xl animate-pulse">✨</span>
          </div>
          
          <div className="space-y-4 mb-4 h-[50vh] overflow-y-auto p-4 rounded-2xl bg-gray-50 shadow-inner custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-6xl mb-4 animate-bounce">👋</p>
                <p className="text-xl mb-6">你好呀！我是奇奇博士！让我们一起探索科学的奥秘吧！</p>
                <p className="text-sm text-gray-400">可以问我任何有趣的科学问题哦！</p>
                <div className="flex justify-center mt-8 space-x-4">
                  <span className="text-3xl animate-floating">🔭</span>
                  <span className="text-3xl animate-pulse">🧪</span>
                  <span className="text-3xl animate-floating" style={{ animationDelay: '0.5s' }}>🪐</span>
                  <span className="text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>🦕</span>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-100 ml-auto max-w-[80%] shadow-md'
                    : 'bg-white mr-auto max-w-[80%] shadow-md border-2 border-purple-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">
                    {message.role === 'user' ? '👧' : '🤖'}
                  </span>
                  <span className="font-medium">
                    {message.role === 'user' ? '你' : '奇奇博士'}
                  </span>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {formatMessage(message.content[0])}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-bounce text-4xl">🤔</div>
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-1" />
                你可以问这些问题：
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => askSuggestedQuestion(question)}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-2 rounded-full text-sm hover:from-purple-200 hover:to-blue-200 transition-all duration-200 border border-purple-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在这里输入你的问题..."
              className="flex-1 p-4 border-2 border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 text-lg"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-full hover:opacity-90 disabled:opacity-50 transition-all duration-200"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </form>

          {messages.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={resetChat}
                className="text-sm text-gray-500 hover:text-purple-500 transition-colors duration-200"
              >
                重新开始对话
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-6 text-center text-xs text-gray-500">
        <p>奇奇博士 - 儿童友好的AI助手 🚀</p>
      </footer>

      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
