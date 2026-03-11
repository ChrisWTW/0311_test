import React, { useState } from 'react';
import { Upload, Users, Gift, List, Shuffle, Trash2, RefreshCw, Download, AlertTriangle, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { cn } from './lib/utils';

type Tab = 'input' | 'draw' | 'group';

const MOCK_NAMES = [
  "王小明", "李小華", "張大山", "陳美麗", "林志明",
  "吳宗憲", "黃小虎", "趙大熊", "周小兔", "孫大龍",
  "王小明", "李小華", // 故意加入重複名單供測試
  "郭小明", "蔡大華", "馬小九", "陳阿扁", "李大輝",
  "朱立倫", "侯友宜", "柯文哲", "賴清德", "蕭美琴"
].join('\n');

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('input');
  const [names, setNames] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');

  // Draw State
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawName, setCurrentDrawName] = useState<string | null>(null);

  // Group State
  const [groupSize, setGroupSize] = useState<number>(4);
  const [groups, setGroups] = useState<string[][]>([]);

  // Input Handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleApplyNames = () => {
    const parsedNames = inputText
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    setNames(parsedNames);
    setWinners([]);
    setGroups([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      // Auto apply
      const parsedNames = text
        .split(/[\n,]+/)
        .map(n => n.trim())
        .filter(n => n.length > 0);
      setNames(parsedNames);
      setWinners([]);
      setGroups([]);
    };
    reader.readAsText(file);
  };

  const clearData = () => {
    setNames([]);
    setInputText('');
    setWinners([]);
    setGroups([]);
  };

  const loadMockData = () => {
    setInputText(MOCK_NAMES);
    const parsedNames = MOCK_NAMES
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setNames(parsedNames);
    setWinners([]);
    setGroups([]);
  };

  const nameCounts = names.reduce((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const hasDuplicates = Object.values(nameCounts).some((count) => (count as number) > 1);

  const handleRemoveDuplicates = () => {
    const uniqueNames = Array.from(new Set(names));
    setNames(uniqueNames);
    setInputText(uniqueNames.join('\n'));
    setWinners([]);
    setGroups([]);
  };

  const handleExportCSV = () => {
    if (groups.length === 0) return;
    
    let csvContent = "組別,成員\n";
    groups.forEach((group, idx) => {
      group.forEach(member => {
        csvContent += `第 ${idx + 1} 組,${member}\n`;
      });
    });

    // 加上 BOM 讓 Excel 可以正確讀取 UTF-8
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', '分組結果.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Draw Logic
  const handleDraw = () => {
    if (names.length === 0) return;
    
    let availablePool = names;
    if (!allowRepeat) {
      availablePool = names.filter(n => !winners.includes(n));
    }

    if (availablePool.length === 0) {
      alert("所有人都已經被抽過了！請重置名單或開啟重複抽取。");
      return;
    }

    setIsDrawing(true);
    
    // Animation effect
    let iterations = 0;
    const maxIterations = 20;
    const interval = setInterval(() => {
      const randomName = availablePool[Math.floor(Math.random() * availablePool.length)];
      setCurrentDrawName(randomName);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        const finalWinner = availablePool[Math.floor(Math.random() * availablePool.length)];
        setCurrentDrawName(finalWinner);
        setWinners(prev => [finalWinner, ...prev]);
        setIsDrawing(false);
        
        // Celebrate
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444']
        });
      }
    }, 100);
  };

  const clearWinners = () => {
    if (confirm("確定要清除所有中獎紀錄嗎？")) {
      setWinners([]);
    }
  };

  // Group Logic
  const handleGenerateGroups = () => {
    if (names.length === 0) return;
    if (groupSize < 1) return;

    // Shuffle array
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const newGroups: string[][] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push(shuffled.slice(i, i + groupSize));
    }
    
    setGroups(newGroups);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Users className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">HR Randomizer Pro</h1>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            目前名單人數: <span className="text-indigo-600 font-bold">{names.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-8 w-fit mx-auto">
          <button
            onClick={() => setActiveTab('input')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'input' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <List className="w-4 h-4" />
            名單輸入
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'draw' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <Gift className="w-4 h-4" />
            獎品抽籤
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'group' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <Shuffle className="w-4 h-4" />
            自動分組
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="max-w-2xl mx-auto border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <List className="w-5 h-5 text-indigo-500" />
                      設定名單
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      請貼上名單，每行一個名字，或是上傳包含名單的 CSV 檔案。
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <textarea
                        value={inputText}
                        onChange={handleTextChange}
                        placeholder="王小明&#10;李小華&#10;張大山..."
                        className="min-h-[200px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors w-full sm:w-auto">
                          <Upload className="w-4 h-4" />
                          上傳 CSV
                          <input
                            type="file"
                            accept=".csv,.txt"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <Button variant="outline" onClick={loadMockData} className="w-full sm:w-auto text-slate-600">
                          <Wand2 className="w-4 h-4 mr-2" />
                          載入測試名單
                        </Button>
                        {names.length > 0 && (
                          <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={clearData}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            清除
                          </Button>
                        )}
                      </div>
                      <Button onClick={handleApplyNames} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                        套用名單 ({inputText.split(/[\n,]+/).filter(n => n.trim().length > 0).length} 人)
                      </Button>
                    </div>

                    {names.length > 0 && (
                      <div className="mt-6 space-y-4">
                        {hasDuplicates && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-amber-800 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>發現重複的名單！這可能會影響抽籤或分組的公平性。</span>
                            </div>
                            <Button size="sm" variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-100" onClick={handleRemoveDuplicates}>
                              一鍵移除重複
                            </Button>
                          </div>
                        )}
                        <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              已載入名單預覽
                            </h4>
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
                              共 {names.length} 人
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-1">
                            {names.map((name, idx) => {
                              const isDuplicate = nameCounts[name] > 1;
                              return (
                                <span 
                                  key={idx} 
                                  className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm border",
                                    isDuplicate 
                                      ? "bg-red-50 border-red-200 text-red-700" 
                                      : "bg-white border-indigo-200 text-indigo-700"
                                  )}
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'draw' && (
              <motion.div
                key="draw"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid md:grid-cols-[1fr_300px] gap-6"
              >
                {/* Draw Area */}
                <Card className="border-slate-200 shadow-sm flex flex-col">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Gift className="w-5 h-5 text-indigo-500" />
                        幸運抽籤
                      </CardTitle>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer select-none bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={allowRepeat}
                          onChange={(e) => setAllowRepeat(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        允許重複中獎
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
                    {names.length === 0 ? (
                      <div className="text-center text-slate-400 flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 opacity-20" />
                        <p>請先至「名單輸入」設定抽籤名單</p>
                        <Button variant="outline" onClick={() => setActiveTab('input')} className="mt-2">
                          前往設定
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="relative w-full max-w-md aspect-[2/1] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-8 overflow-hidden">
                          {isDrawing && (
                            <div className="absolute inset-0 bg-indigo-600/5 animate-pulse" />
                          )}
                          <AnimatePresence mode="popLayout">
                            <motion.div
                              key={currentDrawName || 'empty'}
                              initial={{ opacity: 0, scale: 0.8, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 1.2, y: -20 }}
                              transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              className={cn(
                                "text-4xl sm:text-6xl font-black tracking-tight text-center px-4",
                                isDrawing ? "text-slate-400 blur-[1px]" : "text-indigo-600",
                                !currentDrawName && "text-slate-300 text-2xl sm:text-3xl font-medium"
                              )}
                            >
                              {currentDrawName || "準備抽籤"}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                        
                        <Button 
                          size="lg" 
                          onClick={handleDraw} 
                          disabled={isDrawing || names.length === 0}
                          className="w-full max-w-xs text-lg h-14 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          {isDrawing ? (
                            <>
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                              抽取中...
                            </>
                          ) : (
                            <>
                              <Gift className="w-5 h-5 mr-2" />
                              抽出幸運兒
                            </>
                          )}
                        </Button>
                        
                        {!allowRepeat && names.length > 0 && (
                          <p className="mt-4 text-sm text-slate-500">
                            剩餘可抽人數: <span className="font-bold text-slate-700">{names.filter(n => !winners.includes(n)).length}</span> / {names.length}
                          </p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Winners List */}
                <Card className="border-slate-200 shadow-sm flex flex-col h-[500px] md:h-auto">
                  <CardHeader className="border-b border-slate-100 pb-4 py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <List className="w-4 h-4 text-emerald-500" />
                        中獎名單
                      </CardTitle>
                      {winners.length > 0 && (
                        <button onClick={clearWinners} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                          清除
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-0">
                    {winners.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-slate-400 p-6 text-center">
                        尚無中獎紀錄
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        <AnimatePresence initial={false}>
                          {winners.map((winner, idx) => (
                            <motion.li
                              key={`${winner}-${idx}`}
                              initial={{ opacity: 0, height: 0, backgroundColor: '#f0fdf4' }}
                              animate={{ opacity: 1, height: 'auto', backgroundColor: '#ffffff' }}
                              transition={{ duration: 0.3 }}
                              className="px-6 py-3 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                                  {winners.length - idx}
                                </span>
                                <span className="font-medium text-slate-700">{winner}</span>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'group' && (
              <motion.div
                key="group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shuffle className="w-5 h-5 text-indigo-500" />
                      自動隨機分組
                    </CardTitle>
                    {groups.length > 0 && (
                      <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                        <Download className="w-4 h-4 mr-2" />
                        下載 CSV
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {names.length === 0 ? (
                      <div className="text-center text-slate-400 flex flex-col items-center gap-3 py-8">
                        <Users className="w-12 h-12 opacity-20" />
                        <p>請先至「名單輸入」設定名單</p>
                        <Button variant="outline" onClick={() => setActiveTab('input')} className="mt-2">
                          前往設定
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:w-64 space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            每組人數
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max={names.length}
                              value={groupSize}
                              onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-500 whitespace-nowrap">人 / 組</span>
                          </div>
                        </div>
                        <Button 
                          onClick={handleGenerateGroups}
                          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 h-10 text-white"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          開始分組
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {groups.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {groups.map((group, idx) => (
                        <motion.div
                          key={`group-${idx}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex items-center justify-between">
                              <h4 className="font-semibold text-indigo-900 text-sm">第 {idx + 1} 組</h4>
                              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                {group.length} 人
                              </span>
                            </div>
                            <CardContent className="p-4">
                              <ul className="space-y-2">
                                {group.map((member, mIdx) => (
                                  <li key={mIdx} className="flex items-center gap-2 text-sm text-slate-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                                    {member}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
