import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function LinksManage() {
    const { profile } = useOutletContext()
    const { user } = useAuth()
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Form state
    const [showForm, setShowForm] = useState(false)
    const [editingLink, setEditingLink] = useState(null)
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')

    useEffect(() => {
        if (user) {
            fetchLinks()
        }
    }, [user])

    const fetchLinks = async () => {
        try {
            const { data, error } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', user.id)
                .order('sort_order', { ascending: true })

            if (error) throw error
            setLinks(data || [])
        } catch (error) {
            console.error('Error fetching links:', error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setTitle('')
        setUrl('')
        setEditingLink(null)
        setShowForm(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSaving(true)

        try {
            if (editingLink) {
                // Update existing link
                const { error } = await supabase
                    .from('links')
                    .update({ title, url })
                    .eq('id', editingLink.id)

                if (error) throw error
                setSuccess('Link berhasil diperbarui!')
            } else {
                // Create new link
                const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.sort_order)) : -1
                const { error } = await supabase
                    .from('links')
                    .insert({
                        user_id: user.id,
                        title,
                        url,
                        sort_order: maxOrder + 1,
                    })

                if (error) throw error
                setSuccess('Link berhasil ditambahkan!')
            }

            resetForm()
            await fetchLinks()
        } catch (error) {
            setError(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (link) => {
        setEditingLink(link)
        setTitle(link.title)
        setUrl(link.url)
        setShowForm(true)
        setError('')
        setSuccess('')
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus link ini?')) return

        setError('')
        setSuccess('')

        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('id', id)

            if (error) throw error
            setSuccess('Link berhasil dihapus!')
            await fetchLinks()
        } catch (error) {
            setError(error.message)
        }
    }

    const handleToggleActive = async (link) => {
        try {
            const { error } = await supabase
                .from('links')
                .update({ is_active: !link.is_active })
                .eq('id', link.id)

            if (error) throw error
            await fetchLinks()
        } catch (error) {
            setError(error.message)
        }
    }

    const handleMoveUp = async (index) => {
        if (index === 0) return

        const newLinks = [...links]
        const temp = newLinks[index].sort_order
        newLinks[index].sort_order = newLinks[index - 1].sort_order
        newLinks[index - 1].sort_order = temp

        try {
            await Promise.all([
                supabase.from('links').update({ sort_order: newLinks[index].sort_order }).eq('id', newLinks[index].id),
                supabase.from('links').update({ sort_order: newLinks[index - 1].sort_order }).eq('id', newLinks[index - 1].id),
            ])
            await fetchLinks()
        } catch (error) {
            setError(error.message)
        }
    }

    const handleMoveDown = async (index) => {
        if (index === links.length - 1) return

        const newLinks = [...links]
        const temp = newLinks[index].sort_order
        newLinks[index].sort_order = newLinks[index + 1].sort_order
        newLinks[index + 1].sort_order = temp

        try {
            await Promise.all([
                supabase.from('links').update({ sort_order: newLinks[index].sort_order }).eq('id', newLinks[index].id),
                supabase.from('links').update({ sort_order: newLinks[index + 1].sort_order }).eq('id', newLinks[index + 1].id),
            ])
            await fetchLinks()
        } catch (error) {
            setError(error.message)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Kelola Tautan</h1>
                    <p className="text-slate-400">Tambah dan atur tautan yang ditampilkan</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => { setShowForm(true); setError(''); setSuccess(''); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Tambah Tautan</span>
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl text-sm mb-6">
                    {success}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        {editingLink ? 'Edit Tautan' : 'Tambah Tautan Baru'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                                Judul
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Contoh: Instagram"
                            />
                        </div>
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">
                                URL
                            </label>
                            <input
                                id="url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="https://instagram.com/username"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 disabled:opacity-50"
                            >
                                {saving ? 'Menyimpan...' : (editingLink ? 'Perbarui' : 'Tambah')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Links List */}
            {links.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mb-6 animate-pulse">
                        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Belum ada tautan 🔗</h3>
                    <p className="text-slate-400 mb-6">Yuk, tambahkan tautan pertama Anda untuk mulai membagikan!</p>
                    <button
                        onClick={() => { setShowForm(true); setError(''); setSuccess(''); }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Tautan Pertama
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {links.map((link, index) => (
                        <div
                            key={link.id}
                            className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 border transition-all ${link.is_active ? 'border-white/10' : 'border-white/5 opacity-60'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Order Controls */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === links.length - 1}
                                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Link Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate">{link.title}</h3>
                                    <p className="text-sm text-slate-400 truncate">{link.url}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {/* Toggle Active */}
                                    <button
                                        onClick={() => handleToggleActive(link)}
                                        className={`p-2 rounded-lg transition-colors ${link.is_active
                                            ? 'text-green-400 hover:bg-green-500/20'
                                            : 'text-slate-400 hover:bg-white/10'
                                            }`}
                                        title={link.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    >
                                        {link.is_active ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Edit */}
                                    <button
                                        onClick={() => handleEdit(link)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(link.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
