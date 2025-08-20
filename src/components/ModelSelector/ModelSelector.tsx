import { useState, useRef, useEffect } from 'react';
import { ChevronUp, Sparkles, Zap, Brain, Bot, Crown, Star, Search, Filter, Key, AlertCircle } from 'lucide-react';
import { ModelSelectorProps } from '../../types';
import { models, providers, formatContextLength } from '../../lib/models';
import { useApiKeys } from '../../context/ApiKeyProvider';
import { ApiKeyManager } from '../ApiKeyManager';

export function ModelSelector({ selectedModel, onModelChange, className = '' }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllModels, setShowAllModels] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showApiKeyManager, setShowApiKeyManager] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { hasApiKey } = useApiKeys();

  const selectedModelData = models.find(m => m.id === selectedModel);

  const filteredModels = models.filter(model => {
    const matchesSearch = model.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.provider.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || model.provider.id === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  // Показываем только первые 7 моделей по умолчанию
  const displayedModels = showAllModels ? filteredModels : filteredModels.slice(0, 7);
  const hasMoreModels = filteredModels.length > 7;

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    closeMenu();
  };

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setShowAllModels(false);
    }, 200);
  };

  const getModelIconComponent = (model: any) => {
    if (model.id.includes('gpt-4')) return <Crown className="w-4 h-4 text-yellow-500 model-icon" />;
    if (model.id.includes('gpt-3.5')) return <Zap className="w-4 h-4 text-green-500 model-icon" />;
    if (model.id.includes('claude')) return <Brain className="w-4 h-4 text-blue-500 model-icon" />;
    if (model.id.includes('gemini')) return <Sparkles className="w-4 h-4 text-purple-500 model-icon" />;
    if (model.id.includes('llama')) return <Bot className="w-4 h-4 text-orange-500 model-icon" />;
    if (model.id.includes('qwen')) return <Star className="w-4 h-4 text-pink-500 model-icon" />;
    if (model.id.includes('deepseek')) return <Bot className="w-4 h-4 text-indigo-500 model-icon" />;
    return <Bot className="w-4 h-4 text-gray-500 model-icon" />;
  };

  const handleApiKeyClick = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    setShowApiKeyManager(modelId);
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-divider rounded-lg hover:bg-surface-hover transition-all duration-200 hover:shadow-lg"
      >
        <div className="flex items-center gap-2">
          {selectedModelData && (
            <>
              <span className="text-lg model-icon">{selectedModelData.provider.icon}</span>
              <span className="font-medium text-sm">{selectedModelData.displayName}</span>
            </>
          )}
        </div>
        <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Выпадающее меню - поднимается вверх */}
      {isOpen && (
        <div className={`absolute bottom-full left-0 mb-2 w-96 bg-surface border border-divider rounded-lg shadow-xl z-50 dropdown-menu ${isClosing ? 'closing' : ''}`}>
          {/* Заголовок */}
          <div className="p-4 border-b border-divider gradient-bg">
            <h3 className="font-semibold text-lg mb-3 text-center">🎯 Выберите модель</h3>

            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Поиск моделей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-surface-hover border border-divider rounded-md text-sm search-input"
              />
            </div>

            {/* Фильтр по провайдерам */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedProvider('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 filter-button ${
                  selectedProvider === 'all' ? 'bg-primary text-white shadow-lg active' : 'bg-surface-hover text-muted hover:text-text hover:bg-primary/20'
                }`}
              >
                <Filter className="w-3 h-3" />
                Все
              </button>
              {providers.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 filter-button ${
                    selectedProvider === provider.id ? 'bg-primary text-white shadow-lg active' : 'bg-surface-hover text-muted hover:text-text hover:bg-primary/20'
                  }`}
                >
                  {provider.icon && <span className="text-sm">{provider.icon}</span>}
                  {provider.displayName}
                </button>
              ))}
            </div>
          </div>

          {/* Список моделей с рулеткой */}
          <div className="max-h-96 overflow-y-auto model-roulette">
            {displayedModels.map((model, index) => {
              const modelHasApiKey = hasApiKey(model.id);
              const isModelAvailable = model.isAvailable || modelHasApiKey;
              
              return (
                <div
                  key={model.id}
                  className={`w-full p-3 text-left transition-all duration-200 border-b border-divider last:border-b-0 model-item roulette-item ${
                    selectedModel === model.id ? 'selected' : ''
                  } ${!isModelAvailable ? 'opacity-60' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl model-icon">{model.provider.icon}</span>
                      <div className="flex items-center gap-2">
                        {getModelIconComponent(model)}
                        <span className="font-medium">{model.displayName}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted">
                      {formatContextLength(model.contextLength)}
                    </div>
                  </div>
                  
                  {/* Статус API ключа */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {modelHasApiKey ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          API подключен
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Подключите свой API ключ
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Кнопка управления API ключом */}
                      <button
                        onClick={(e) => handleApiKeyClick(e, model.id)}
                        className={`px-2 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
                          modelHasApiKey
                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }`}
                        title={modelHasApiKey ? 'Управление API ключом' : 'Добавить API ключ'}
                      >
                        <Key className="w-3 h-3" />
                        {modelHasApiKey ? 'Управлять' : 'Добавить'}
                      </button>
                      
                      {/* Кнопка выбора модели */}
                      <button
                        onClick={() => handleModelSelect(model.id)}
                        disabled={!isModelAvailable}
                        className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                          selectedModel === model.id
                            ? 'bg-primary text-white'
                            : isModelAvailable
                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {selectedModel === model.id ? 'Выбрано' : 'Выбрать'}
                      </button>
                    </div>
                  </div>
                  
                  {model.id === selectedModel && (
                    <div className="flex items-center gap-1 mt-2 text-primary text-xs">
                      <Star className="w-3 h-3 fill-current selection-star" />
                      Выбрано
                    </div>
                  )}
                </div>
              );
            })}

            {/* Кнопка "Показать больше" */}
            {hasMoreModels && !showAllModels && (
              <button
                onClick={() => setShowAllModels(true)}
                className="w-full p-3 text-center text-primary hover:bg-primary/10 transition-all duration-200 border-t border-divider hover:transform hover:scale-105"
              >
                🔽 Показать все модели ({filteredModels.length - 7} еще)
              </button>
            )}

            {/* Кнопка "Свернуть" */}
            {showAllModels && (
              <button
                onClick={() => setShowAllModels(false)}
                className="w-full p-3 text-center text-primary hover:bg-primary/10 transition-all duration-200 border-t border-divider hover:transform hover:scale-105"
              >
                🔼 Свернуть
              </button>
            )}
          </div>

          {/* Подсказка */}
          <div className="p-3 gradient-bg text-xs text-muted text-center border-t border-divider">
            💡 Разные модели имеют разные возможности и цены • {filteredModels.length} доступно
          </div>
        </div>
      )}

      {/* Модал управления API ключами */}
      {showApiKeyManager && (
        <ApiKeyManager
          model={models.find(m => m.id === showApiKeyManager)!}
          onClose={() => setShowApiKeyManager(null)}
        />
      )}

      {/* Оверлей для закрытия */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeMenu}
        />
      )}
    </div>
  );
}
