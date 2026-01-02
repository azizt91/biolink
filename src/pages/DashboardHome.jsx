import { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'

export default function DashboardHome() {
    const { profile, loading } = useOutletContext()
    const [copied, setCopied] = useState(false)

    const getPublicUrl = () => {
        return `${window.location.origin}/${profile?.username}`
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(getPublicUrl())
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
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
        <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    Selamat datang{profile?.full_name ? `, ${profile.full_name}` : ''}! 👋
                </h1>
                <p className="text-slate-400">
                    Kelola tautan dan profil Anda dari dasbor ini.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
                <Link
                    to="/dashboard/links"
                    className="group bg-white/5 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/10 hover:border-purple-500/50 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                                Kelola Tautan
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Tambah, edit, atau hapus tautan yang ingin ditampilkan
                            </p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/dashboard/profile"
                    className="group bg-white/5 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/10 hover:border-purple-500/50 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                                Edit Profil
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Ubah nama pengguna, nama, atau foto profil Anda
                            </p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Public Page Link */}
            {profile?.username && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-purple-500/30">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-base lg:text-lg font-semibold text-white mb-1">Halaman Publik Anda</h3>
                            <p className="text-slate-300 text-sm">
                                Bagikan tautan ini ke pengikut Anda
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="bg-white/10 rounded-xl px-3 py-2 text-purple-300 font-mono text-xs sm:text-sm break-all">
                                {getPublicUrl()}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleCopyLink}
                                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${copied
                                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                                            : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Tersalin!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>Salin</span>
                                        </>
                                    )}
                                </button>
                                <Link
                                    to={`/${profile.username}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span>Lihat</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

