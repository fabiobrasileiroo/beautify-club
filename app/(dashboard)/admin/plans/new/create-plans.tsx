"use client"

import React, { JSX, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Check, X } from 'lucide-react';
import { z } from 'zod';

// Schema de validação Zod baseado no modelo SubscriptionPlan
const subscriptionPlanSchema = z.object({
  name: z.string()
    .min(1, 'Nome do plano é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  price: z.number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(99999.99, 'Preço muito alto'),
  max_services_per_month: z.number()
    .int('Deve ser um número inteiro')
    .min(1, 'Deve ser pelo menos 1')
    .nullable()
    .optional(),
  features: z.string()
    .min(1, 'Adicione pelo menos uma funcionalidade')
});

type SubscriptionPlanFormData = {
  name: string;
  price: string;
  max_services_per_month: string;
  features: string;
};

interface ApiResponse {
  error?: string;
  id?: string;
  name?: string;
}

interface Message {
  type: 'success' | 'error';
  content: string;
}

export default function CreateNewPlanPage(): JSX.Element {
  const [formData, setFormData] = useState<SubscriptionPlanFormData>({
    name: '',
    price: '',
    max_services_per_month: '',
    features: ''
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message>({ type: 'error', content: '' });
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro de validação do campo alterado
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addFeature = (): void => {
    if (currentFeature.trim() && !featuresList.includes(currentFeature.trim())) {
      const newFeatures = [...featuresList, currentFeature.trim()];
      setFeaturesList(newFeatures);
      setFormData(prev => ({
        ...prev,
        features: newFeatures.join(';')
      }));
      setCurrentFeature('');
      
      // Limpar erro de validação das features
      if (validationErrors.features) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.features;
          return newErrors;
        });
      }
    }
  };

  const removeFeature = (index: number): void => {
    const newFeatures = featuresList.filter((_, i) => i !== index);
    setFeaturesList(newFeatures);
    setFormData(prev => ({
      ...prev,
      features: newFeatures.join(';')
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  const validateForm = () => {
    try {
      const dataToValidate = {
        name: formData.name.trim(),
        price: parseFloat(formData.price) || 0,
        max_services_per_month: formData.max_services_per_month 
          ? parseInt(formData.max_services_per_month) 
          : null,
        features: formData.features
      };

      subscriptionPlanSchema.parse(dataToValidate);
      setValidationErrors({});
      return dataToValidate;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return null;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setMessage({ type: 'error', content: '' });

    const validatedData = validateForm();
    
    if (!validatedData) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar plano');
      }

      setMessage({ 
        type: 'success', 
        content: 'Plano criado com sucesso!' 
      });

      // Resetar formulário
      setFormData({
        name: '',
        price: '',
        max_services_per_month: '',
        features: ''
      });
      setFeaturesList([]);
      setValidationErrors({});

    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string): string => {
    if (!price) return '0,00';
    const numericPrice = parseFloat(price);
    return isNaN(numericPrice) ? '0,00' : numericPrice.toFixed(2).replace('.', ',');
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Criar Novo Plano de Assinatura</CardTitle>
          <CardDescription>
            Defina os detalhes do novo plano que será oferecido aos usuários
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Nome do Plano */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Plano Básico, Plano Premium..."
                className={`w-full ${validationErrors.name ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço Mensal (R$) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                max="99999.99"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                className={`w-full ${validationErrors.price ? 'border-red-500' : ''}`}
              />
              {validationErrors.price && (
                <p className="text-sm text-red-600">{validationErrors.price}</p>
              )}
            </div>

            {/* Máximo de Serviços por Mês */}
            <div className="space-y-2">
              <Label htmlFor="max_services_per_month">
                Máximo de Serviços por Mês
                <span className="text-sm text-gray-500 ml-2">(deixe vazio para ilimitado)</span>
              </Label>
              <Input
                id="max_services_per_month"
                name="max_services_per_month"
                type="number"
                min="1"
                value={formData.max_services_per_month}
                onChange={handleInputChange}
                placeholder="Ex: 5, 10, 20..."
                className={`w-full ${validationErrors.max_services_per_month ? 'border-red-500' : ''}`}
              />
              {validationErrors.max_services_per_month && (
                <p className="text-sm text-red-600">{validationErrors.max_services_per_month}</p>
              )}
            </div>

            {/* Funcionalidades */}
            <div className="space-y-2">
              <Label>Funcionalidades do Plano *</Label>
              <div className="flex gap-2">
                <Input
                  value={currentFeature}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentFeature(e.target.value)}
                  placeholder="Digite uma funcionalidade..."
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addFeature}
                  variant="outline"
                  size="sm"
                  disabled={!currentFeature.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {validationErrors.features && (
                <p className="text-sm text-red-600">{validationErrors.features}</p>
              )}
              
              {/* Lista de Funcionalidades */}
              {featuresList.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label className="text-sm font-medium">
                    Funcionalidades adicionadas ({featuresList.length}):
                  </Label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {featuresList.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span className="text-sm flex-1">{feature}</span>
                        <Button
                          type="button"
                          onClick={() => removeFeature(index)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mensagem de Feedback */}
            {message.content && (
              <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                  {message.content}
                </AlertDescription>
              </Alert>
            )}

            {/* Botão de Envio */}
            <Button 
              onClick={handleSubmit}
              className="w-full" 
              disabled={isLoading || featuresList.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Plano...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Criar Plano
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Plano */}
      {(formData.name || formData.price || featuresList.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Preview do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Nome:</span>
                <span className="text-gray-700">{formData.name || 'Nome do plano'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Preço:</span>
                <span className="text-gray-700 font-semibold">
                  R$ {formatPrice(formData.price)}/mês
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Serviços por mês:</span>
                <span className="text-gray-700">
                  {formData.max_services_per_month || 'Ilimitado'}
                </span>
              </div>
              {featuresList.length > 0 && (
                <div>
                  <span className="font-medium">Funcionalidades ({featuresList.length}):</span>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    {featuresList.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}