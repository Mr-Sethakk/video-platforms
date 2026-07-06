'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Film, Image, Check } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'
import Empty from '@/components/ui/Empty'
import { useAuth } from '@/hooks/useAuth'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/api'
import { GENRES } from '@/lib/constants'

const VIP_OPTIONS = [
  { value: 'USER', label: '免费观看' },
  { value: 'VIP', label: 'VIP 专属' },
  { value: 'VVIP', label: 'VVIP 专属' },
  { value: 'SVIP', label: 'SVIP 专属' },
]

export default function AdminVideoUploadPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { isAdmin, isAuthenticated } = useAuth()
  const { count: watchlistCount } = useWatchlist()
  const fileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [requiredVipLevel, setRequiredVipLevel] = useState('USER')
  const [movieId, setMovieId] = useState('')

  // Files
  const [videoFile, setVideoFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Movies list (for dropdown)
  const [movies, setMovies] = useState([])
  const [moviesLoading, setMoviesLoading] = useState(false)

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  // Load movies for dropdown
  const loadMovies = useCallback(async () => {
    if (movies.length > 0) return
    setMoviesLoading(true)
    try {
      const data = await apiFetch('/movies?pageSize=100')
      setMovies(data.records || [])
    } catch {
      setMovies([])
    } finally {
      setMoviesLoading(false)
    }
  }, [movies.length])

  const handleVideoDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
    } else {
      addToast('请选择视频文件', 'error')
    }
  }, [addToast])

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) setVideoFile(file)
  }, [])

  const handleCoverChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = () => setCoverPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }, [])

  const handleCoverDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file)
      const reader = new FileReader()
      reader.onload = () => setCoverPreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      addToast('请选择图片文件', 'error')
    }
  }, [addToast])

  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setCategory('')
    setRequiredVipLevel('USER')
    setMovieId('')
    setVideoFile(null)
    setCoverFile(null)
    setCoverPreview(null)
    setUploadProgress(0)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) { addToast('请输入视频标题', 'error'); return }
    if (!videoFile) { addToast('请选择视频文件', 'error'); return }

    setSubmitting(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('category', category || '')
      formData.append('requiredVipLevel', requiredVipLevel)
      if (movieId) formData.append('movieId', movieId)
      if (coverFile) formData.append('coverFile', coverFile)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      await apiFetch('/admin/videos', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for multipart
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      addToast('视频发布成功！', 'success')
      setTimeout(() => {
        resetForm()
        router.push('/admin/videos')
      }, 500)
    } catch (e) {
      addToast(e.message || '上传失败', 'error')
      setUploadProgress(0)
    } finally {
      setSubmitting(false)
    }
  }, [title, description, category, requiredVipLevel, movieId, videoFile, coverFile, addToast, resetForm, router])

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="flex pt-14">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} watchlistCount={watchlistCount} isAdmin={isAdmin} />
          <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
            <div className="flex items-center justify-center min-h-[400px]">
              <Empty title="无权限访问" description="此页面仅限管理员访问" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
      <div className="flex pt-14">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} watchlistCount={watchlistCount} isAdmin={isAdmin} />
        <main className={`flex-1 min-h-[calc(100vh-56px)] transition-[margin] duration-200 ml-0 ${sidebarOpen ? 'sm:ml-60' : 'sm:ml-16'}`}>
          <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.push('/admin/videos')}
                className="inline-flex items-center gap-1.5 text-sm text-[#AAAAAA] hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] hover:bg-[#272727]"
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
                返回
              </button>
              <h1 className="text-2xl font-bold">📤 上传视频</h1>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#AAAAAA] mb-2">视频标题 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入视频标题..."
                  className="w-full h-12 rounded-xl bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 text-white placeholder:text-[#717171] text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#AAAAAA] mb-2">视频简介</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="输入视频简介..."
                  rows={4}
                  className="w-full rounded-xl bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 py-3 text-white placeholder:text-[#717171] text-sm resize-none"
                />
              </div>

              {/* Category + VIP Level row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-[#AAAAAA] mb-2">分类</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 rounded-xl bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 text-white text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#212121]">选择分类</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g} className="bg-[#212121]">{g}</option>
                    ))}
                  </select>
                </div>

                {/* VIP Level */}
                <div>
                  <label className="block text-sm font-medium text-[#AAAAAA] mb-2">所需VIP等级</label>
                  <div className="flex gap-2">
                    {VIP_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRequiredVipLevel(opt.value)}
                        className={`flex-1 py-2 rounded-full text-xs font-medium border transition-colors ${
                          requiredVipLevel === opt.value
                            ? 'bg-[#6366F1] border-[#6366F1] text-white'
                            : 'bg-[#121212] border-[#303030] text-[#AAAAAA] hover:border-[#6366F1]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Associated Movie */}
              <div>
                <label className="block text-sm font-medium text-[#AAAAAA] mb-2">关联电影</label>
                <select
                  value={movieId}
                  onChange={(e) => setMovieId(e.target.value)}
                  onFocus={loadMovies}
                  className="w-full h-12 rounded-xl bg-[#121212] border border-[#303030] focus:border-[#6366F1] focus:outline-none px-4 text-white text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#212121]">不关联（独立视频）</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#212121]">
                      {m.title} ({m.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover image upload */}
              <div>
                <label className="block text-sm font-medium text-[#AAAAAA] mb-2">封面图</label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  onDrop={handleCoverDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    coverPreview
                      ? 'border-[#22C55E]/50 bg-[#22C55E]/5 aspect-video relative overflow-hidden'
                      : 'border-[#303030] hover:border-[#6366F1] bg-[#121212] h-40'
                  }`}
                >
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="封面预览" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                      >
                        <X size={14} strokeWidth={2} className="text-white" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Image size={32} strokeWidth={1.5} className="text-[#717171] mb-2" />
                      <p className="text-sm text-[#717171]">拖拽图片至此或点击上传</p>
                      <p className="text-xs text-[#555] mt-1">支持 JPG/PNG</p>
                    </>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Video file upload */}
              <div>
                <label className="block text-sm font-medium text-[#AAAAAA] mb-2">视频文件 *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleVideoDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    videoFile
                      ? 'border-[#22C55E]/50 bg-[#22C55E]/5 h-20'
                      : 'border-[#303030] hover:border-[#6366F1] bg-[#121212] h-40'
                  }`}
                >
                  {videoFile ? (
                    <div className="flex items-center gap-3 px-4">
                      <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                        <Check size={20} strokeWidth={2} className="text-[#22C55E]" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{videoFile.name}</p>
                        <p className="text-xs text-[#AAAAAA]">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                        className="w-7 h-7 rounded-full bg-[#303030] flex items-center justify-center hover:bg-red-500/80 transition-colors ml-auto"
                      >
                        <X size={14} strokeWidth={2} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Film size={32} strokeWidth={1.5} className="text-[#717171] mb-2" />
                      <p className="text-sm text-[#717171]">拖拽视频至此或点击上传</p>
                      <p className="text-xs text-[#555] mt-1">支持 MP4/AVI/MOV，≤2GB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Progress bar */}
              {uploadProgress > 0 && (
                <div className="bg-[#121212] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#6366F1] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !videoFile}
                  className="flex-1 h-12 rounded-full bg-[#6366F1] text-white font-medium hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {uploadProgress > 0 ? `上传中 ${uploadProgress}%` : '发布中...'}
                    </span>
                  ) : (
                    '🚀 发布视频'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/videos')}
                  className="px-6 h-12 rounded-full bg-[#303030] text-white font-medium hover:bg-[#3F3F3F] transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
