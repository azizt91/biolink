import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PublicProfile() {
    const { username } = useParams()
    const [profile, setProfile] = useState(null)
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [username])

    const fetchProfile = async () => {
        try {
            // Fetch profile by username
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username.toLowerCase())
                .single()

            if (profileError || !profileData) {
                setNotFound(true)
                setLoading(false)
                return
            }

            setProfile(profileData)

            // Fetch active links
            const { data: linksData } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', profileData.id)
                .eq('is_active', true)
                .order('sort_order', { ascending: true })

            setLinks(linksData || [])
        } catch (error) {
            console.error('Error fetching profile:', error)
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
                    <p className="text-slate-400 mb-6">User @{username} tidak ditemukan</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8 lg:py-16">
            <div className="max-w-md mx-auto">
                {/* Profile Header */}
                <div className="text-center mb-8">
                    {/* Avatar */}
                    {profile.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name || profile.username}
                            className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover mx-auto mb-4 border-4 border-purple-500/50 shadow-lg shadow-purple-500/30"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                            }}
                        />
                    ) : null}
                    <div
                        className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white text-4xl lg:text-5xl font-bold mx-auto mb-4 border-4 border-purple-500/50 shadow-lg shadow-purple-500/30 ${profile.avatar_url ? 'hidden' : 'flex'}`}
                    >
                        {profile.full_name?.charAt(0) || profile.username?.charAt(0) || '?'}
                    </div>

                    {/* Name */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                        {profile.full_name || `@${profile.username}`}
                    </h1>
                    {profile.full_name && (
                        <p className="text-slate-400">@{profile.username}</p>
                    )}
                </div>

                {/* Links */}
                <div className="space-y-3">
                    {links.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-400">Belum ada tautan</p>
                        </div>
                    ) : (
                        links.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-center text-white font-medium hover:bg-white/20 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                            >
                                <span className="group-hover:text-purple-300 transition-colors">{link.title}</span>
                            </a>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-400 text-sm transition-colors"
                    >
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        Buat Bio Link Anda sendiri
                    </Link>
                </div>
            </div>
        </div>
    )
}
