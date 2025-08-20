import { useState } from 'react';
import { Key, X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useApiKeys } from '../../context/ApiKeyProvider';
import { LLMModel } from '../../types';

interface ApiKeyManagerProps {
  model: LLMModel;
  onClose: () => void;
}

export function ApiKeyManager({ model, onClose }: ApiKeyManagerProps) {
  const { setApiKey, removeApiKey, hasApiKey, getApiKey } = useApiKeys();
  const [apiKey, setApiKeyLocal] = useState(getApiKey(model.id) || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API ключ не может быть пустым');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Валидируем API ключ (базовая проверка)
      if (!apiKey.startsWith('sk-')) {
        setError('API ключ должен начинаться с "sk-"');
        return;
      }

      // Сохраняем API ключ
      setApiKey(model.id, apiKey.trim());
      
      // Закрываем модал
      onClose();
    } catch (err) {
      setError('Ошибка при сохранении API ключа');
      console.error('Error saving API key:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    removeApiKey(model.id);
    setApiKeyLocal('');
    onClose();
  };

  const hasExistingKey = hasApiKey(model.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-divider rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-divider">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{model.provider.icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{model.displayName}</h3>
              <p className="text-sm text-muted">{model.provider.displayName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-hover rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-4">
          {hasExistingKey ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">API ключ подключен</span>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  Модель {model.displayName} готова к использованию с вашим API ключом.
                </p>
              </div>

              <button
                onClick={handleRemove}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Удалить API ключ
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">API ключ не подключен</span>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  Для использования модели {model.displayName} необходимо подключить API ключ от {model.provider.displayName}.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text">
                  API ключ {model.provider.displayName}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKeyLocal(e.target.value)}
                    placeholder={`sk-... (ваш API ключ ${model.provider.displayName})`}
                    className="w-full px-3 py-2 pr-20 bg-surface-hover border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1 hover:bg-surface rounded transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-surface-hover hover:bg-surface border border-divider rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !apiKey.trim()}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Сохранить
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Подсказка */}
        <div className="p-4 bg-surface-hover border-t border-divider rounded-b-lg">
          <p className="text-xs text-muted text-center">
            💡 API ключи сохраняются локально в вашем браузере и не передаются третьим лицам
          </p>
        </div>
      </div>
    </div>
  );
}
