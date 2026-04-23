import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Tag, FolderOpen } from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { adminBlogService } from '../../services/blogApi';
import type { BlogCategory, BlogTag } from '../../types/blog';

export function AdminBlogCategoriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [editingCat, setEditingCat] = useState<BlogCategory | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: () => adminBlogService.listCategories(),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['admin-blog-tags'],
    queryFn: () => adminBlogService.listTags(),
  });

  const createCatMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => adminBlogService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
      setNewCatName('');
      setNewCatDesc('');
    },
  });

  const updateCatMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string } }) =>
      adminBlogService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
      setEditingCat(null);
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: number) => adminBlogService.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] }),
  });

  const createTagMutation = useMutation({
    mutationFn: (data: { name: string }) => adminBlogService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-tags'] });
      setNewTagName('');
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => adminBlogService.deleteTag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blog-tags'] }),
  });

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/blog')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Categorias & Tags</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-olive-600" />
            Categorias
          </h2>

          {/* Add Category */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nome da categoria"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
            </div>
            <Button
              size="sm"
              onClick={() => newCatName.trim() && createCatMutation.mutate({ name: newCatName.trim(), description: newCatDesc.trim() || undefined })}
              disabled={!newCatName.trim() || createCatMutation.isPending}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Criar
            </Button>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map((cat: BlogCategory) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                {editingCat?.id === cat.id ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      type="text"
                      defaultValue={cat.name}
                      onBlur={(e) => {
                        if (e.target.value.trim() !== cat.name) {
                          updateCatMutation.mutate({ id: cat.id, data: { name: e.target.value.trim() } });
                        } else {
                          setEditingCat(null);
                        }
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{cat._count?.posts || 0} posts · /{cat.slug}</p>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCat(cat)}
                    className="p-1.5 text-gray-400 hover:text-olive-600 rounded"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir categoria "${cat.name}"?`)) deleteCatMutation.mutate(cat.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma categoria</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-olive-600" />
            Tags
          </h2>

          {/* Add Tag */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTagName.trim()) {
                  createTagMutation.mutate({ name: newTagName.trim() });
                }
              }}
              placeholder="Nome da tag"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-olive-200"
            />
            <Button
              size="sm"
              onClick={() => newTagName.trim() && createTagMutation.mutate({ name: newTagName.trim() })}
              disabled={!newTagName.trim() || createTagMutation.isPending}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Criar
            </Button>
          </div>

          {/* Tags Cloud */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: BlogTag) => (
              <div
                key={tag.id}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
              >
                <span className="text-gray-700">{tag.name}</span>
                <span className="text-xs text-gray-400">({tag._count?.posts || 0})</span>
                <button
                  onClick={() => {
                    if (confirm(`Excluir tag "${tag.name}"?`)) deleteTagMutation.mutate(tag.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4 w-full">Nenhuma tag</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminBlogCategoriesPage;
