import os
import json
import asyncio
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dataclasses import asdict

from core import PromptBuilder, TokenEstimator, HistoryStore, ProviderManager
from models.schemas import ChatMessage, ChatRequest, ChatResponse
from adapters import ProviderFactory


# Глобальные объекты
provider_manager = None
prompt_builder = PromptBuilder()
token_estimator = TokenEstimator()
history_store = HistoryStore()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Инициализация при старте
    global provider_manager
    provider_manager = ProviderManager()
    print("🤖 Multi-provider AI Chat API started")
    print(f"📡 Available providers: {', '.join(provider_manager.get_available_providers())}")
    
    yield
    
    # Очистка при выходе
    print("👋 Shutting down...")


app = FastAPI(
    title="Multi-Provider AI Chat API",
    description="Unified API for multiple AI providers with model switching",
    version="2.0.0",
    lifespan=lifespan
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Модели Pydantic для новых эндпоинтов
class ProviderConfig(BaseModel):
    enabled: bool = True
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    models: Dict[str, Dict[str, Any]] = {}


class ModelToggle(BaseModel):
    enabled: bool


@app.get("/health")
async def health_check():
    """Проверка состояния API"""
    return {
        "status": "healthy", 
        "version": "2.0.0",
        "providers": provider_manager.get_available_providers() if provider_manager else []
    }


@app.get("/providers")
async def get_providers():
    """Получить список всех провайдеров"""
    if not provider_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")
    
    providers = []
    for provider_name in ProviderFactory.get_available_providers():
        config = provider_manager.get_provider_config(provider_name)
        validation = provider_manager.validate_all_providers().get(provider_name, False)
        
        providers.append({
            "id": provider_name,
            "name": provider_name.title(),
            "enabled": config.get("enabled", False),
            "configured": validation,
            "has_api_key": bool(config.get("api_key"))
        })
    
    return {"providers": providers}


@app.put("/providers/{provider_name}")
async def update_provider(provider_name: str, config: ProviderConfig):
    """Обновить конфигурацию провайдера"""
    if not provider_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")
    
    try:
        provider_manager.update_provider_config(provider_name, config.dict(exclude_unset=True))
        return {"message": f"Provider {provider_name} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/providers/{provider_name}/toggle")
async def toggle_provider(provider_name: str, toggle: ModelToggle):
    """Включить/выключить провайдера"""
    if not provider_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")
    
    try:
        provider_manager.enable_provider(provider_name, toggle.enabled)
        return {"message": f"Provider {provider_name} {'enabled' if toggle.enabled else 'disabled'}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/models")
async def get_models():
    """Получить все доступные модели"""
    if not provider_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")
    
    models = provider_manager.get_all_models()
    return {"models": models}


@app.get("/models/{provider_name}")
async def get_provider_models(provider_name: str):
    """Получить модели конкретного провайдера"""
    if not provider_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")
    
    try:
        provider = provider_manager.get_provider(provider_name)
        models = provider.list_models()
        return {"models": [asdict(model) for model in models]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/models/{provider_name}/{model_id}/toggle")
async def toggle_model(provider_name: str, model_id: str, toggle: ModelToggle):
    """Включить/выключить модель"""
    if not provider_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")
    
    try:
        provider_manager.enable_model(provider_name, model_id, toggle.enabled)
        return {"message": f"Model {model_id} {'enabled' if toggle.enabled else 'disabled'}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Потоковый чат с выбранной моделью"""
    if not provider_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")
    
    try:
        # Парсим model_id для получения провайдера и модели
        if '/' in request.model:
            provider_name, model_id = request.model.split('/', 1)
        else:
            # Если провайдер не указан, ищем модель среди всех провайдеров
            model_info = provider_manager.get_model_by_id(request.model)
            if not model_info:
                raise HTTPException(status_code=404, detail=f"Model {request.model} not found")
            provider_name = model_info['provider']
            model_id = request.model
        
        # Получаем провайдера
        provider = provider_manager.get_provider(provider_name)
        
        # Сохраняем историю если нужно
        if request.save_history:
            await history_store.save_conversation_async(
                request.conversation_id or "default",
                request.messages
            )
        
        # Получаем обработанные сообщения
        messages = prompt_builder.build_messages(request.messages, request.system_message)
        
        # Стриминг от провайдера
        async def stream_generator():
            try:
                async for chunk in provider.stream_chat(
                    messages=messages,
                    model=model_id,
                    temperature=request.temperature,
                    max_tokens=request.max_tokens
                ):
                    # Конвертируем StreamChunk в формат SSE
                    if chunk.finished:
                        yield f"data: {json.dumps({'type': 'done', 'usage': chunk.usage})}\n\n"
                        break
                    elif chunk.delta:
                        yield f"data: {json.dumps({'type': 'content', 'delta': chunk.delta})}\n\n"
                    elif chunk.reasoning:
                        yield f"data: {json.dumps({'type': 'reasoning', 'content': chunk.reasoning})}\n\n"
                    elif chunk.tool_calls:
                        yield f"data: {json.dumps({'type': 'tool_calls', 'data': chunk.tool_calls})}\n\n"
                    elif chunk.usage:
                        yield f"data: {json.dumps({'type': 'usage', 'data': chunk.usage})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        
        return StreamingResponse(
            stream_generator(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/chat")  
async def chat_completion(request: ChatRequest):
    """Обычный чат без стриминга"""
    if not provider_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")
    
    try:
        # Парсим model_id
        if '/' in request.model:
            provider_name, model_id = request.model.split('/', 1)
        else:
            model_info = provider_manager.get_model_by_id(request.model)
            if not model_info:
                raise HTTPException(status_code=404, detail=f"Model {request.model} not found")
            provider_name = model_info['provider']
            model_id = request.model
        
        provider = provider_manager.get_provider(provider_name)
        messages = prompt_builder.build_messages(request.messages, request.system_message)
        
        # Собираем весь ответ
        content = ""
        usage = None
        reasoning = None
        
        async for chunk in provider.stream_chat(
            messages=messages,
            model=model_id,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        ):
            if chunk.delta:
                content += chunk.delta
            elif chunk.usage:
                usage = chunk.usage
            elif chunk.reasoning:
                reasoning = chunk.reasoning
            elif chunk.finished:
                break
        
        # Сохраняем историю
        if request.save_history:
            conversation_messages = request.messages + [{"role": "assistant", "content": content}]
            await history_store.save_conversation_async(
                request.conversation_id or "default",
                conversation_messages
            )
        
        response = ChatResponse(
            message=content,
            model=request.model,
            provider=provider_name,
            usage=usage or {},
            reasoning=reasoning
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/history/{conversation_id}")
async def get_history(conversation_id: str):
    """Получить историю разговора"""
    try:
        messages = await history_store.load_conversation_async(conversation_id)
        return {"conversation_id": conversation_id, "messages": messages}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/history/{conversation_id}")
async def delete_history(conversation_id: str):
    """Удалить историю разговора"""
    try:
        # Реализовать удаление истории
        return {"message": f"History for {conversation_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
