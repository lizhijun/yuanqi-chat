'use client';

import { useState, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon, MicrophoneIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';

// Suggested questions for kids to ask
const SUGGESTED_QUESTIONS = [
  "为什么天空是蓝色的？",
  "恐龙为什么会灭绝？",
  "为什么星星会眨眼睛？",
  "月亮为什么有时候是圆的，有时候是弯的？",
  "为什么下雨的时候会打雷？",
  "彩虹是怎么形成的？",
  "人为什么会做梦？",
  "为什么我们要刷牙？",
  "植物是怎么长大的？",
  "为什么我们能听到回声？"
];

// Emoji categories for fun exploration
const EMOJI_CATEGORIES = [
  { name: '动物', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'] },
  { name: '食物', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍍'] },
  { name: '交通', emojis: ['🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚀'] },
  { name: '表情', emojis: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊'] },
];

// Character emojis for kids to select
const CHARACTER_EMOJIS = ['👧', '👦', '🧒', '👶', '🐱', '🐶', '🐼', '🐯', '🦊', '🐰'];

// Background themes for kids to select
const BACKGROUND_THEMES = [
  { name: '太空', gradient: 'from-indigo-200 to-purple-200', emoji: '🚀', className: 'bg-galaxy' },
  { name: '海洋', gradient: 'from-blue-200 to-cyan-200', emoji: '🐬', className: '' },
  { name: '森林', gradient: 'from-green-200 to-emerald-200', emoji: '🌳', className: '' },
  { name: '沙漠', gradient: 'from-yellow-200 to-amber-200', emoji: '🏜️', className: '' },
  { name: '彩虹', gradient: 'from-red-200 via-yellow-200 to-green-200', emoji: '🌈', className: '' },
];

// Achievement badges for kids
const ACHIEVEMENTS = [
  { id: 'first_question', name: '好奇宝宝', emoji: '🔍', description: '问出第一个问题' },
  { id: 'five_questions', name: '小小探索家', emoji: '🧭', description: '问了5个问题' },
  { id: 'used_voice', name: '语音达人', emoji: '🎤', description: '使用了语音输入' },
  { id: 'changed_theme', name: '装扮大师', emoji: '🎨', description: '更换了背景主题' },
  { id: 'changed_character', name: '交朋友', emoji: '🤝', description: '选择了新伙伴' },
  { id: 'emoji_expert', name: '表情专家', emoji: '😎', description: '探索了表情符号' },
  { id: 'streak_3', name: '连续提问', emoji: '🔥', description: '连续提问3次' },
];

// Learning tips for kids
const LEARNING_TIPS = [
  { tip: "尝试提出\"为什么\"的问题，这会帮助你更好地理解世界！", emoji: "🧠" },
  { tip: "当你学到新知识时，试着向别人解释一下，这样能记得更牢！", emoji: "👩‍🏫" },
  { tip: "好奇心是最好的老师，不断提问能让你变得更聪明！", emoji: "💡" },
  { tip: "画一幅图或记笔记可以帮助你记住新知识哦！", emoji: "📝" },
  { tip: "科学家也会犯错，从错误中学习是科学的一部分！", emoji: "🔬" },
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

// Define interfaces for message content
interface TextContent {
  type: 'text';
  text: string;
}

interface MessageContent {
  role: 'user' | 'assistant';
  content: TextContent[];
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      }
    }
  }
}

interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function Home() {
  const [messages, setMessages] = useState<MessageContent[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState('large'); // Default to large for kids
  const [selectedEmoji, setSelectedEmoji] = useState('👧'); // Default character emoji
  const [selectedTheme, setSelectedTheme] = useState(BACKGROUND_THEMES[0]); // Default theme
  const [achievements, setAchievements] = useState<string[]>([]); // Unlocked achievements
  const [showNewAchievement, setShowNewAchievement] = useState<string | null>(null); // Recently unlocked achievement
  const [showSettings, setShowSettings] = useState(false); // Settings panel toggle
  const [streak, setStreak] = useState(0); // Question streak counter
  const [showEmojiExplorer, setShowEmojiExplorer] = useState(false); // Emoji explorer toggle
  const [showTip, setShowTip] = useState<boolean>(false); // Show learning tip
  const [currentTip, setCurrentTip] = useState<number>(0); // Current tip index

  // Initialize confetti and first tip on mount
  useEffect(() => {
    setShowConfetti(true);
    
    // Show initial tip after 5 seconds
    const tipTimer = setTimeout(() => {
      setShowTip(true);
      
      // Hide tip after 7 seconds
      setTimeout(() => {
        setShowTip(false);
      }, 7000);
    }, 5000);
    
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(tipTimer);
    };
  }, []);

  // Show a new tip every 3 minutes
  useEffect(() => {
    const tipInterval = setInterval(() => {
      // Pick next tip
      setCurrentTip(prev => (prev + 1) % LEARNING_TIPS.length);
      
      // Show tip
      setShowTip(true);
      
      // Hide tip after 7 seconds
      setTimeout(() => {
        setShowTip(false);
      }, 7000);
    }, 3 * 60 * 1000); // 3 minutes
    
    return () => clearInterval(tipInterval);
  }, []);

  // Check for streak achievement
  useEffect(() => {
    if (streak >= 3) {
      unlockAchievement('streak_3');
    }
  }, [streak]);

  // Function to unlock achievements
  const unlockAchievement = (achievementId: string) => {
    if (!achievements.includes(achievementId)) {
      setAchievements(prev => [...prev, achievementId]);
      setShowNewAchievement(achievementId);
      setShowConfetti(true);
      
      // Hide achievement notification after 3 seconds
      setTimeout(() => {
        setShowNewAchievement(null);
        setShowConfetti(false);
      }, 3000);
    }
  };

  // Function to toggle emoji explorer
  const toggleEmojiExplorer = () => {
    setShowEmojiExplorer(!showEmojiExplorer);
    if (!achievements.includes('emoji_expert')) {
      unlockAchievement('emoji_expert');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: MessageContent = {
      role: 'user',
      content: [{ type: 'text', text: input }]
    };

    // Increment streak when user asks a question
    setStreak(prev => prev + 1);
    
    // Check for achievements
    if (messages.length === 0) {
      unlockAchievement('first_question');
    }
    
    if (messages.filter(m => m.role === 'user').length === 4) {
      unlockAchievement('five_questions');
    }

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
        const assistantMessage: MessageContent = {
          role: 'assistant',
          content: [{ type: 'text', text: data.choices[0].message.content }]
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Automatically read the response aloud
        speakText(data.choices[0].message.content);
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

  const formatMessage = (text: string | TextContent) => {
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
    setStreak(0);
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const startVoiceRecognition = () => {
    if (typeof window === 'undefined') return; // Guard against SSR

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('你的浏览器不支持语音识别功能，请尝试使用Chrome或Edge浏览器。');
      return;
    }

    setIsListening(true);
    
    // Unlock achievement for using voice input
    unlockAchievement('used_voice');
    
    const SpeechRecognitionAPI = ((window.webkitSpeechRecognition || window.SpeechRecognition) as SpeechRecognitionConstructor);
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Function to speak text aloud
  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      alert('你的浏览器不支持语音合成功能，请尝试使用Chrome或Edge浏览器。');
      return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9; // Slightly slower rate for children
    utterance.pitch = 1.1; // Slightly higher pitch for friendlier tone
    
    // Get Chinese voice if available
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('cmn'));
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }
    
    // Speech events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Function to stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Function to toggle font size
  const toggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('x-large');
    else setFontSize('normal');
  };

  // Function to change character emoji
  const changeCharacter = (emoji: string) => {
    setSelectedEmoji(emoji);
    // Unlock achievement for changing character
    unlockAchievement('changed_character');
  };
  
  // Function to change background theme
  const changeTheme = (theme: typeof BACKGROUND_THEMES[0]) => {
    setSelectedTheme(theme);
    // Unlock achievement for changing theme
    unlockAchievement('changed_theme');
  };

  // Function to dismiss tip manually
  const dismissTip = () => {
    setShowTip(false);
  };

  return (
    <main className={`flex min-h-screen flex-col items-center p-4 bg-gradient-to-b ${selectedTheme.gradient} ${selectedTheme.className}`}>
      {showConfetti && <Confetti />}
      
      {/* Learning Tip */}
      {showTip && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center animate-pop-up">
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3 shadow-lg max-w-sm mx-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl animate-floating mt-1">
                {LEARNING_TIPS[currentTip].emoji}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">学习小贴士：</p>
                <p className="text-sm">{LEARNING_TIPS[currentTip].tip}</p>
              </div>
              <button 
                onClick={dismissTip}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Achievement notification */}
      {showNewAchievement && (
        <div className="fixed top-20 inset-x-0 z-50 flex justify-center animate-celebrate">
          <div className="bg-yellow-100 border-4 border-yellow-400 rounded-xl p-4 shadow-lg flex items-center gap-3">
            <div className="text-4xl animate-floating">
              {ACHIEVEMENTS.find(a => a.id === showNewAchievement)?.emoji || '🎉'}
            </div>
            <div>
              <p className="font-bold text-lg">解锁新成就！</p>
              <p className="text-md">{ACHIEVEMENTS.find(a => a.id === showNewAchievement)?.name || '未知成就'}</p>
              <p className="text-sm text-gray-600">{ACHIEVEMENTS.find(a => a.id === showNewAchievement)?.description || ''}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Emoji Explorer */}
      {showEmojiExplorer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end md:items-center justify-center animate-pop-up" onClick={() => setShowEmojiExplorer(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg mx-4 p-4 shadow-2xl paper-fold" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold rainbow-text">表情符号探索</h2>
              <button onClick={() => setShowEmojiExplorer(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="mb-4 overflow-y-auto max-h-[60vh]">
              {EMOJI_CATEGORIES.map((category, i) => (
                <div key={i} className="mb-4">
                  <h3 className="font-bold mb-2 wavy-underline inline-block">{category.name}</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {category.emojis.map((emoji, j) => (
                      <button 
                        key={j}
                        onClick={() => setInput(prev => prev + emoji)}
                        className="text-3xl p-2 bg-gray-100 rounded-lg hover:bg-yellow-100 animate-jelly"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-2">点击表情可以添加到你的消息中</p>
          </div>
        </div>
      )}
      
      {/* Settings panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center animate-bounce-in" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 rainbow-text">设置</h2>
            
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <span className="mr-2">👤</span>
                选择你的小伙伴：
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {CHARACTER_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => changeCharacter(emoji)}
                    className={`text-4xl p-2 rounded-full transition-all duration-200 ${
                      selectedEmoji === emoji 
                        ? 'bg-yellow-200 scale-125 shadow-md animate-bounce-in' 
                        : 'bg-gray-100 hover:bg-yellow-100'
                    } animate-jelly`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <span className="mr-2">🎨</span>
                选择背景主题：
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {BACKGROUND_THEMES.map((theme, index) => (
                  <button
                    key={index}
                    onClick={() => changeTheme(theme)}
                    className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center bg-gradient-to-r ${theme.gradient} ${
                      selectedTheme.name === theme.name 
                        ? 'scale-110 shadow-md border-2 border-yellow-400' 
                        : 'hover:scale-105'
                    }`}
                  >
                    <span className="text-3xl mb-1">{theme.emoji}</span>
                    <span className="font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <span className="mr-2">📏</span>
                文字大小：
              </h3>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => setFontSize('normal')}
                  className={`px-4 py-2 rounded-xl ${fontSize === 'normal' ? 'bg-blue-200 font-bold' : 'bg-gray-100'} animate-jelly`}
                >
                  小
                </button>
                <button 
                  onClick={() => setFontSize('large')}
                  className={`px-4 py-2 rounded-xl ${fontSize === 'large' ? 'bg-blue-200 font-bold' : 'bg-gray-100'} animate-jelly`}
                >
                  中
                </button>
                <button 
                  onClick={() => setFontSize('x-large')}
                  className={`px-4 py-2 rounded-xl ${fontSize === 'x-large' ? 'bg-blue-200 font-bold' : 'bg-gray-100'} animate-jelly`}
                >
                  大
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <span className="mr-2">🏆</span>
                我的成就：
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 ${
                      achievements.includes(achievement.id) 
                        ? 'bg-yellow-100 border-yellow-400' 
                        : 'bg-gray-100 border-gray-200 opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{achievement.emoji}</span>
                    <div>
                      <p className="font-bold text-sm">{achievement.name}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setShowSettings(false)}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:opacity-90 animate-jelly"
            >
              完成
            </button>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-yellow-400 animate-breathing">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-5xl animate-floating">🤖</span>
              <h1 className="text-3xl md:text-4xl font-bold text-center rainbow-text animate-wiggle">
                奇奇博士的科学乐园
              </h1>
              <span className="text-5xl animate-twinkle">✨</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Streak counter */}
              {streak > 0 && (
                <div className="bg-orange-100 border-2 border-orange-300 rounded-full px-3 py-1 flex items-center gap-1 animate-pulse">
                  <span className="text-lg">🔥</span>
                  <span className="font-bold text-orange-600">{streak}</span>
                </div>
              )}
              
              {/* Emoji button */}
              <button 
                onClick={toggleEmojiExplorer}
                className="bg-green-200 hover:bg-green-300 p-3 rounded-full transition-all duration-200 shadow-md hover:scale-105 animate-jelly"
                title="表情符号"
              >
                <span className="text-2xl">😀</span>
              </button>
              
              {/* Settings button */}
              <button 
                onClick={() => setShowSettings(true)}
                className="bg-purple-200 hover:bg-purple-300 p-3 rounded-full transition-all duration-200 shadow-md hover:scale-105 animate-jelly"
                title="设置"
              >
                <span className="text-2xl">⚙️</span>
              </button>
              
              {/* Font size button - kept for quick access */}
              <button 
                onClick={toggleFontSize}
                className="bg-yellow-200 hover:bg-yellow-300 p-3 rounded-full transition-all duration-200 shadow-md animate-jelly"
                title="调整字体大小"
              >
                <span className="text-2xl font-bold">
                  {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-4 h-[45vh] overflow-y-auto p-4 rounded-2xl bg-blue-50 shadow-inner custom-scrollbar border-4 border-blue-200">
            {messages.length === 0 && (
              <div className="text-center mt-8 animate-bounce-in">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute -top-6 -right-6 bg-yellow-300 rounded-full p-3 rotate-12 animate-pulse rainbow-border">
                      <span className="text-xl">👋 你好!</span>
                    </div>
                    <div className="text-7xl mb-4 animate-bounce">🤖</div>
                  </div>
                </div>
                <p className="text-2xl mb-6 font-medium text-purple-700">我是奇奇博士！让我们一起探索科学的奥秘吧！</p>
                <div className="speech-bubble inline-block p-4 mb-4">
                  <p className="text-lg">可以问我任何有趣的科学问题哦！点击下面的问题试试吧！</p>
                </div>
                <div className="flex justify-center mt-8 space-x-6">
                  <span className="text-5xl animate-floating">🔭</span>
                  <span className="text-5xl animate-twinkle">🧪</span>
                  <span className="text-5xl animate-floating" style={{ animationDelay: '0.5s' }}>🪐</span>
                  <span className="text-5xl animate-twinkle" style={{ animationDelay: '0.5s' }}>🦕</span>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl animate-bounce-in ${
                  message.role === 'user'
                    ? 'bg-green-100 ml-auto max-w-[80%] shadow-md border-2 border-green-200'
                    : 'bg-purple-100 mr-auto max-w-[80%] shadow-md border-2 border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {message.role === 'user' ? selectedEmoji : '🤖'}
                    </span>
                    <span className="font-bold text-lg">
                      {message.role === 'user' ? '你' : '奇奇博士'}
                    </span>
                  </div>
                  
                  {message.role === 'assistant' && (
                    <button
                      onClick={isSpeaking ? stopSpeaking : () => speakText(message.content[0].text)}
                      className="p-2 rounded-full hover:bg-white transition-colors duration-200 bg-purple-200 hover:scale-110 animate-jelly"
                      title={isSpeaking ? "停止朗读" : "朗读回答"}
                    >
                      {isSpeaking ? (
                        <SpeakerXMarkIcon className="h-6 w-6 text-red-500" />
                      ) : (
                        <SpeakerWaveIcon className="h-6 w-6 text-green-500" />
                      )}
                    </button>
                  )}
                </div>
                
                <div className={`text-gray-700 leading-relaxed ${
                  fontSize === 'large' ? 'text-xl' : 
                  fontSize === 'x-large' ? 'text-2xl' : 'text-base'
                }`}>
                  {formatMessage(message.content[0])}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center">
                <div className="animate-bounce text-6xl">🤔</div>
                <div className="ml-3 text-lg font-medium text-purple-600 animate-pulse">正在思考中...</div>
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-2xl shadow-md animate-bounce-in border-2 border-yellow-300">
              <p className="text-lg font-bold text-purple-600 mb-2 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" />
                试试问这些有趣的问题：
              </p>
              <div className="flex flex-wrap gap-3">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => askSuggestedQuestion(question)}
                    className="bg-gradient-to-r from-purple-200 to-blue-200 px-4 py-3 rounded-xl text-md font-medium hover:scale-105 transition-all duration-200 border-2 border-purple-300 shadow-md animate-jelly"
                  >
                    {question}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t-2 border-yellow-200">
                <p className="text-sm text-center font-medium text-orange-500">
                  <span className="inline-block animate-floating mr-1">💡</span>
                  点击问题或者在下方输入框中输入你想问的问题，然后点击发送按钮
                  <span className="inline-block animate-floating ml-1">👇</span>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在这里输入你的问题..."
                className="w-full p-5 border-4 border-purple-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-400 text-xl shadow-md animate-border"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={startVoiceRecognition}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full ${
                  isListening ? 'bg-red-400 animate-pulse' : 'bg-yellow-300 hover:bg-yellow-400'
                } shadow-md hover:scale-110 animate-jelly`}
                title="点击说话"
                disabled={isLoading}
              >
                <MicrophoneIcon className="h-7 w-7 text-gray-700" />
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 rounded-2xl hover:scale-105 disabled:opacity-50 transition-all duration-200 shadow-md animate-jelly"
              title="发送问题"
            >
              <PaperAirplaneIcon className="h-7 w-7" />
            </button>
          </form>

          {messages.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={resetChat}
                className="bg-yellow-300 hover:bg-yellow-400 text-lg font-medium py-2 px-6 rounded-xl transition-all duration-200 shadow-md hover:scale-105 animate-jelly"
              >
                重新开始对话 🔄
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-6 text-center text-sm text-gray-600 bg-white p-2 rounded-lg shadow-md">
        <p>奇奇博士 - 儿童友好的AI助手 🚀</p>
        <p>Powered by 腾讯混元大模型 + 腾讯元器</p>
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
