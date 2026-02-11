// Olive Baby Web - Admin AI Assistant Page
import { useState, useEffect } from 'react';
import {
  Brain,
  Settings,
  BookOpen,
  Play,
  Plus,
  Edit2,
  Save,
  X,
  Check,
  AlertCircle,
  Trash2,
  Copy,
  RefreshCw,
  Upload,
  Archive,
  Eye,
  Tag,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button, Card, Badge, Spinner, Input, Modal } from '../../components/ui';
import { adminAiService } from '../../services/api';
import type { AiAssistantConfig, KnowledgeBaseDocument, KbStats, PromptPreview } from '../../types/admin';
import { cn } from '../../lib/utils';

export function AdminAiAssistantPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'kb' | 'playground'>('config');
  const [configs, setConfigs] = useState<AiAssistantConfig[]>([]);
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [kbStats, setKbStats] = useState<KbStats | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Config editing
  const [editingConfig, setEditingConfig] = useState<AiAssistantConfig | null>(null);
  const [configForm, setConfigForm] = useState({
    name: '',
    systemPrompt: '',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2048,
    guardrails: {} as Record<string, unknown>,
  });

  // Document editing
  const [editingDoc, setEditingDoc] = useState<KnowledgeBaseDocument | null>(null);
  const [docForm, setDocForm] = useState({
    title: '',
    sourceType: 'manual' as 'file' | 'url' | 'manual',
    content: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Preview
  const [preview, setPreview] = useState<PromptPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Modals
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'config' | 'doc'; id: number } | null>(null);
  const [confirmPublish, setConfirmPublish] = useState<{ type: 'config' | 'doc'; id: number } | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, tagFilter, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'config') {
        const response = await adminAiService.getConfigs();
        if (response.success) {
          setConfigs(response.data);
        }
      } else if (activeTab === 'kb') {
        const [docsRes, statsRes, tagsRes] = await Promise.all([
          adminAiService.listDocuments({
            status: statusFilter || undefined,
            tag: tagFilter || undefined,
            q: searchQuery || undefined,
          }),
          adminAiService.getKbStats(),
          adminAiService.getAllTags(),
        ]);
        if (docsRes.success) setDocuments(docsRes.data);
        if (statsRes.success) setKbStats(statsRes.data);
        if (tagsRes.success) setAllTags(tagsRes.data);
      } else if (activeTab === 'playground') {
        const response = await adminAiService.previewPrompt();
        if (response.success) setPreview(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ type: 'error', message: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  // Config actions
  const handleCreateConfig = async () => {
    try {
      await adminAiService.createConfig(configForm);
      setToast({ type: 'success', message: 'Configuração criada' });
      setShowConfigModal(false);
      resetConfigForm();
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao criar configuração' });
    }
  };

  const handleUpdateConfig = async () => {
    if (!editingConfig) return;
    try {
      await adminAiService.updateConfig(editingConfig.id, configForm);
      setToast({ type: 'success', message: 'Configuração atualizada' });
      setShowConfigModal(false);
      resetConfigForm();
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao atualizar configuração' });
    }
  };

  const handlePublishConfig = async (id: number) => {
    try {
      await adminAiService.publishConfig(id);
      setToast({ type: 'success', message: 'Configuração publicada!' });
      setConfirmPublish(null);
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao publicar' });
    }
  };

  const handleDuplicateConfig = async (id: number) => {
    try {
      await adminAiService.duplicateConfig(id);
      setToast({ type: 'success', message: 'Configuração duplicada' });
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao duplicar' });
    }
  };

  const handleDeleteConfig = async (id: number) => {
    try {
      await adminAiService.deleteConfig(id);
      setToast({ type: 'success', message: 'Configuração excluída' });
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao excluir' });
    }
  };

  // Document actions
  const handleCreateDoc = async () => {
    try {
      await adminAiService.createDocument(docForm);
      setToast({ type: 'success', message: 'Documento criado' });
      setShowDocModal(false);
      resetDocForm();
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao criar documento' });
    }
  };

  const handleUpdateDoc = async () => {
    if (!editingDoc) return;
    try {
      await adminAiService.updateDocument(editingDoc.id, docForm);
      setToast({ type: 'success', message: 'Documento atualizado' });
      setShowDocModal(false);
      resetDocForm();
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao atualizar documento' });
    }
  };

  const handlePublishDoc = async (id: number) => {
    try {
      await adminAiService.publishDocument(id);
      setToast({ type: 'success', message: 'Documento publicado!' });
      setConfirmPublish(null);
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao publicar' });
    }
  };

  const handleArchiveDoc = async (id: number) => {
    try {
      await adminAiService.archiveDocument(id);
      setToast({ type: 'success', message: 'Documento arquivado' });
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao arquivar' });
    }
  };

  const handleDeleteDoc = async (id: number) => {
    try {
      await adminAiService.deleteDocument(id);
      setToast({ type: 'success', message: 'Documento excluído' });
      setConfirmDelete(null);
      loadData();
    } catch (error) {
      setToast({ type: 'error', message: 'Erro ao excluir' });
    }
  };

  // Helpers
  const resetConfigForm = () => {
    setEditingConfig(null);
    setConfigForm({
      name: '',
      systemPrompt: '',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2048,
      guardrails: {},
    });
  };

  const resetDocForm = () => {
    setEditingDoc(null);
    setDocForm({
      title: '',
      sourceType: 'manual',
      content: '',
      tags: [],
    });
  };

  const openEditConfig = (config: AiAssistantConfig) => {
    setEditingConfig(config);
    setConfigForm({
      name: config.name,
      systemPrompt: config.systemPrompt,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      guardrails: config.guardrails,
    });
    setShowConfigModal(true);
  };

  const openEditDoc = (doc: KnowledgeBaseDocument) => {
    setEditingDoc(doc);
    setDocForm({
      title: doc.title,
      sourceType: doc.sourceType,
      content: doc.content,
      tags: doc.tags,
    });
    setShowDocModal(true);
  };

  const addTag = () => {
    if (newTag.trim() && !docForm.tags.includes(newTag.trim())) {
      setDocForm({ ...docForm, tags: [...docForm.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setDocForm({ ...docForm, tags: docForm.tags.filter((t) => t !== tag) });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
      PUBLISHED: { label: 'Publicado', variant: 'success' },
      DRAFT: { label: 'Rascunho', variant: 'warning' },
      ARCHIVED: { label: 'Arquivado', variant: 'secondary' },
    };
    const config = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2',
            toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          )}
        >
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-olive-600" />
            AI Assistant Admin
          </h1>
          <p className="text-gray-500">Configurar prompt, base de conhecimento e testar</p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {[
            { key: 'config', label: 'Configuração', icon: Settings },
            { key: 'kb', label: 'Base de Conhecimento', icon: BookOpen },
            { key: 'playground', label: 'Playground', icon: Play },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-olive-500 text-olive-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Config Tab */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => { resetConfigForm(); setShowConfigModal(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Configuração
                </Button>
              </div>

              {configs.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                  Nenhuma configuração encontrada. Crie uma nova.
                </Card>
              ) : (
                configs.map((config) => (
                  <Card key={config.id} className={cn('p-6', config.isPublished && 'border-green-500 border-2')}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                          {getStatusBadge(config.status)}
                          {config.isPublished && <Badge variant="success">ATIVO</Badge>}
                          <span className="text-sm text-gray-500">v{config.version}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Modelo:</strong> {config.model}</p>
                          <p><strong>Temperature:</strong> {config.temperature}</p>
                          <p><strong>Max Tokens:</strong> {config.maxTokens}</p>
                          <p className="mt-2"><strong>Prompt:</strong></p>
                          <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                            {config.systemPrompt.slice(0, 500)}
                            {config.systemPrompt.length > 500 && '...'}
                          </pre>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditConfig(config)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDuplicateConfig(config.id)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!config.isPublished && (
                          <>
                            <Button size="sm" onClick={() => setConfirmPublish({ type: 'config', id: config.id })}>
                              <Upload className="w-4 h-4 mr-1" />
                              Publicar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => setConfirmDelete({ type: 'config', id: config.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* KB Tab */}
          {activeTab === 'kb' && (
            <div className="space-y-4">
              {/* Stats */}
              {kbStats && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{kbStats.total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{kbStats.published}</p>
                    <p className="text-sm text-gray-500">Publicados</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{kbStats.draft}</p>
                    <p className="text-sm text-gray-500">Rascunhos</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-400">{kbStats.archived}</p>
                    <p className="text-sm text-gray-500">Arquivados</p>
                  </Card>
                </div>
              )}

              {/* Filters */}
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="DRAFT">Rascunho</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="ARCHIVED">Arquivado</option>
                </select>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Todas as tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <div className="flex-1" />
                <Button onClick={() => { resetDocForm(); setShowDocModal(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Documento
                </Button>
              </div>

              {/* Documents List */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atualizado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {documents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            Nenhum documento encontrado
                          </td>
                        </tr>
                      ) : (
                        documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{doc.title}</td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">{doc.sourceType}</Badge>
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {doc.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {doc.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{doc.tags.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc.updatedAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => openEditDoc(doc)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                {doc.status === 'DRAFT' && (
                                  <Button size="sm" variant="ghost" onClick={() => setConfirmPublish({ type: 'doc', id: doc.id })}>
                                    <Upload className="w-4 h-4" />
                                  </Button>
                                )}
                                {doc.status !== 'ARCHIVED' && (
                                  <Button size="sm" variant="ghost" onClick={() => handleArchiveDoc(doc.id)}>
                                    <Archive className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => setConfirmDelete({ type: 'doc', id: doc.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Playground Tab */}
          {activeTab === 'playground' && preview && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview do Prompt Atual
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Configuração Ativa</h4>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-48">
                      {preview.config?.systemPrompt || '(Nenhuma configuração publicada)'}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Base de Conhecimento ({preview.knowledgeBase.documentCount} docs)
                    </h4>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-48">
                      {preview.knowledgeBase.content || '(Nenhum documento publicado)'}
                    </pre>
                  </div>

                  {preview.assembledPrompt && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Prompt Completo Montado</h4>
                      <pre className="bg-blue-50 border border-blue-200 p-4 rounded text-sm overflow-auto max-h-64">
                        {preview.assembledPrompt}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">🧪 Chat de Teste</h3>
                <p className="text-gray-500 text-sm">
                  Playground de chat para testar o assistente. (Em breve - integração com endpoint /ai/chat)
                </p>
                <div className="mt-4 bg-gray-100 rounded-lg p-8 text-center text-gray-400">
                  Chat de teste em desenvolvimento
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Config Modal */}
      {showConfigModal && (
        <Modal
          isOpen={showConfigModal}
          onClose={() => { setShowConfigModal(false); resetConfigForm(); }}
          title={editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <Input
                value={configForm.name}
                onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                placeholder="Ex: Assistente Materno v2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea
                value={configForm.systemPrompt}
                onChange={(e) => setConfigForm({ ...configForm, systemPrompt: e.target.value })}
                className="w-full border rounded-lg p-3 text-sm min-h-[200px]"
                placeholder="Você é um assistente especializado em cuidados infantis..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <select
                  value={configForm.model}
                  onChange={(e) => setConfigForm({ ...configForm, model: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={configForm.temperature}
                  onChange={(e) => setConfigForm({ ...configForm, temperature: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <Input
                  type="number"
                  step="100"
                  min="100"
                  max="8000"
                  value={configForm.maxTokens}
                  onChange={(e) => setConfigForm({ ...configForm, maxTokens: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => { setShowConfigModal(false); resetConfigForm(); }}>
                Cancelar
              </Button>
              <Button onClick={editingConfig ? handleUpdateConfig : handleCreateConfig}>
                <Save className="w-4 h-4 mr-2" />
                {editingConfig ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Modal */}
      {showDocModal && (
        <Modal
          isOpen={showDocModal}
          onClose={() => { setShowDocModal(false); resetDocForm(); }}
          title={editingDoc ? 'Editar Documento' : 'Novo Documento'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <Input
                value={docForm.title}
                onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                placeholder="Ex: Guia de Amamentação"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Fonte</label>
              <select
                value={docForm.sourceType}
                onChange={(e) => setDocForm({ ...docForm, sourceType: e.target.value as any })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="manual">Manual</option>
                <option value="file">Arquivo</option>
                <option value="url">URL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (Markdown)</label>
              <textarea
                value={docForm.content}
                onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                className="w-full border rounded-lg p-3 text-sm min-h-[200px] font-mono"
                placeholder="# Título&#10;&#10;Conteúdo em markdown..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {docForm.tags.map((tag) => (
                  <span key={tag} className="bg-olive-100 text-olive-700 px-2 py-1 rounded text-sm flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-600">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Nova tag"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => { setShowDocModal(false); resetDocForm(); }}>
                Cancelar
              </Button>
              <Button onClick={editingDoc ? handleUpdateDoc : handleCreateDoc}>
                <Save className="w-4 h-4 mr-2" />
                {editingDoc ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <Modal isOpen={true} onClose={() => setConfirmDelete(null)} title="Confirmar Exclusão">
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja excluir? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                confirmDelete.type === 'config'
                  ? handleDeleteConfig(confirmDelete.id)
                  : handleDeleteDoc(confirmDelete.id)
              }
            >
              Excluir
            </Button>
          </div>
        </Modal>
      )}

      {/* Confirm Publish Modal */}
      {confirmPublish && (
        <Modal isOpen={true} onClose={() => setConfirmPublish(null)} title="Confirmar Publicação">
          <p className="text-gray-600 mb-6">
            {confirmPublish.type === 'config'
              ? 'Ao publicar, esta configuração será ativada e substituirá a atual.'
              : 'Ao publicar, este documento ficará disponível na base de conhecimento.'}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmPublish(null)}>Cancelar</Button>
            <Button
              onClick={() =>
                confirmPublish.type === 'config'
                  ? handlePublishConfig(confirmPublish.id)
                  : handlePublishDoc(confirmPublish.id)
              }
            >
              <Upload className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

export default AdminAiAssistantPage;
