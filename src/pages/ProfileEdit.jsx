import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function ProfileEdit() {
    const { profile, refreshProfile } = useOutletContext()
    const { user } = useAuth()
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '')
            setFullName(profile.full_name || '')
            setAvatarUrl(profile.avatar_url || '')
        }
    }, [profile])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return setError('Nama pengguna hanya boleh mengandung huruf, angka, dan garis bawah')
        }

        setLoading(true)

        try {
            // Check if username is taken by another user
            if (username !== profile?.username) {
                const { data: existingUser } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('username', username.toLowerCase())
                    .neq('id', user.id)
                    .single()

                if (existingUser) {
                    setError('Username sudah digunakan')
                    setLoading(false)
                    return
                }
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    username: username.toLowerCase(),
                    full_name: fullName,
                    avatar_url: avatarUrl || null,
                })
                .eq('id', user.id)

            if (error) throw error

            setSuccess('Profil berhasil diperbarui!')
            await refreshProfile()
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Edit Profil</h1>
                <p className="text-slate-400">Ubah informasi profil Anda</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-white/10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl text-sm">
                            {success}
                        </div>
                    )}

                    {/* Avatar Preview */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.nextSibling.style.display = 'flex'
                                    }}
                                />
                            ) : null}
                            <div
                                className={`w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white text-3xl font-bold border-4 border-purple-500/50 ${avatarUrl ? 'hidden' : 'flex'}`}
                            >
                                {fullName?.charAt(0) || username?.charAt(0) || '?'}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                required
                                className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="username"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">URL: domain.com/{username || 'username'}</p>
                    </div>

                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                            Nama Lengkap
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Nama Anda"
                        />
                    </div>

                    <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-300 mb-2">
                            URL Avatar (opsional)
                        </label>
                        <input
                            id="avatarUrl"
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="https://example.com/avatar.jpg"
                        />
                        <p className="text-xs text-slate-500 mt-1">Masukkan URL gambar untuk foto profil</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Menyimpan...
                            </span>
                        ) : (
                            'Simpan Perubahan'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
