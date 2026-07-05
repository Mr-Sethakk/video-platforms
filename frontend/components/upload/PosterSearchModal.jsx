'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, Film, AlertCircle, Image, Search, Star, Clock, User, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 使用 Canvas 压缩图片
 * - 长边最大 2000px
 * - 转为 JPEG，质量 0.85
 * - 返回压缩后的 Blob
 */
function compressImage(file, maxLongSide = 2000, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      // 如果图片已经很小，直接返回原文件
      if (width <= maxLongSide && height <= maxLongSide && file.size < 500 * 1024) {
        resolve(file);
        return;
      }
      // 等比缩放
      let newW = width;
      let newH = height;
      if (width >= height && width > maxLongSide) {
        newW = maxLongSide;
        newH = Math.round((height / width) * maxLongSide);
      } else if (height > maxLongSide) {
        newH = maxLongSide;
        newW = Math.round((width / height) * maxLongSide);
      }
      // Canvas 绘制
      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newW, newH);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg') || 'poster.jpg', {
              type: 'image/jpeg',
            }));
          } else {
            resolve(file); // fallback
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // 无法加载图片，用原文件
    };
    img.src = url;
  });
}

/** 识别状态枚举 */
const STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  RECOGNIZING: 'recognizing',
  SINGLE: 'single',
  MULTI: 'multi',
  FAIL_NOT_POSTER: 'fail_not_poster',
  FAIL_BLURRY: 'fail_blurry',
  FAIL_ERROR: 'fail_error',
};

export default function PosterSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);
  const [history, setHistory] = useState([]);

  // 从 localStorage 加载识别历史
  useEffect(() => {
    try {
      const stored = localStorage.getItem('poster_recognition_history');
      if (stored) {
        setHistory(JSON.parse(stored).slice(0, 10));
      }
    } catch {}
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setPreview(null);
    setResults([]);
    setErrorMsg('');
    setProgress(0);
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  // 关闭时重置
  useEffect(() => {
    if (!isOpen) {
      // 延迟重置以允许关闭动画
      const t = setTimeout(reset, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, reset]);

  // 模拟进度条
  const startProgress = useCallback(() => {
    setProgress(0);
    let p = 0;
    progressTimer.current = setInterval(() => {
      p += Math.random() * 15 + 3;
      if (p >= 90) {
        p = 90;
        clearInterval(progressTimer.current);
      }
      setProgress(Math.min(p, 90));
    }, 400);
  }, []);

  const finishProgress = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setProgress(100);
  }, []);

  // 校验文件
  const validateFile = useCallback((file) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('仅支持 PNG、JPG、WEBP 格式');
      setStatus(STATUS.FAIL_ERROR);
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('图片大小不能超过 10MB');
      setStatus(STATUS.FAIL_ERROR);
      return false;
    }
    return true;
  }, []);

  // 处理文件上传
  const handleFile = useCallback(async (file) => {
    if (!validateFile(file)) return;

    // 生成预览（用原图）
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // 上传并识别
    setStatus(STATUS.UPLOADING);
    startProgress();

    try {
      // 压缩图片：限制长边 2000px，转 JPEG 85% 质量
      setStatus(STATUS.UPLOADING);
      const compressed = await compressImage(file, 2000, 0.85);
      console.log(`图片压缩: ${formatFileSize(file.size)} → ${formatFileSize(compressed.size)}`);

      const formData = new FormData();
      formData.append('poster', compressed);

      setStatus(STATUS.RECOGNIZING);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(`${API_BASE}/ai/poster/recognize`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      finishProgress();
      const json = await res.json();

      if (!json.success) {
        setStatus(STATUS.FAIL_ERROR);
        setErrorMsg(json.message || '识别失败，请稍后重试');
        return;
      }

      const data = json.data;
      const movieResults = data.results || [];

      // 保存到历史记录
      if (movieResults.length > 0) {
        const record = {
          preview: reader.result,
          title: movieResults[0].title,
          movieId: movieResults[0].id,
          timestamp: Date.now(),
        };
        const newHistory = [record, ...history].slice(0, 10);
        setHistory(newHistory);
        try {
          localStorage.setItem('poster_recognition_history', JSON.stringify(newHistory));
        } catch {}
      }

      if (movieResults.length === 0) {
        setStatus(STATUS.FAIL_NOT_POSTER);
      } else if (movieResults.length === 1) {
        setResults(movieResults);
        setStatus(STATUS.SINGLE);
      } else {
        setResults(movieResults);
        setStatus(STATUS.MULTI);
      }

    } catch (err) {
      finishProgress();
      setStatus(STATUS.FAIL_ERROR);
      setErrorMsg('网络错误，请检查网络后重试');
    }
  }, [validateFile, startProgress, finishProgress, history]);

  // 点击上传
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 文件选择
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleFile]);

  // 拖拽
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // 剪贴板粘贴
  useEffect(() => {
    if (!isOpen || status !== STATUS.IDLE) return;
    const handler = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [isOpen, status, handleFile]);

  // 查看电影详情
  const handleViewDetail = useCallback((movieId) => {
    onClose();
    router.push(`/movies/${movieId}`);
  }, [router, onClose]);

  // 重新上传
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  // 删除单条历史记录
  const removeHistoryItem = useCallback((index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    try {
      localStorage.setItem('poster_recognition_history', JSON.stringify(newHistory));
    } catch {}
  }, [history]);

  // 清空全部历史记录
  const clearAllHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('poster_recognition_history');
    } catch {}
  }, []);

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} maxWidth="max-w-[600px]">
      <div className="w-full max-w-[560px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Camera size={20} strokeWidth={1.5} className="text-[#6366F1]" />
          <h2 className="text-lg font-bold text-white">识图找片</h2>
        </div>

        {/* === IDLE: 上传区域 === */}
        {(status === STATUS.IDLE) && (
          <>
            <div
              onClick={handleClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#6366F1] bg-[rgba(99,102,241,0.08)] scale-[1.01]'
                  : 'border-[#404040] hover:border-[#6366F1] hover:bg-[rgba(99,102,241,0.03)]'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mb-4">
                  <Upload size={28} strokeWidth={1.5} className="text-[#6366F1]" />
                </div>
                <p className="text-white font-medium mb-1">点击或拖拽上传电影海报</p>
                <p className="text-sm text-[#717171] mb-4">支持 PNG、JPG、WEBP，最大 10MB</p>
                <p className="text-xs text-[#555]">也可以直接 Ctrl+V 粘贴截图</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* 历史记录 */}
            {history.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#717171] font-medium">最近识别</p>
                  <button
                    onClick={clearAllHistory}
                    className="text-xs text-[#555] hover:text-[#EF4444] transition-colors flex items-center gap-1"
                    title="清空全部记录"
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                    清空
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {history.map((item, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-20 group cursor-pointer relative"
                      onClick={() => item.movieId && handleViewDetail(item.movieId)}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); removeHistoryItem(i); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                        title="删除此记录"
                      >
                        <X size={10} strokeWidth={2.5} />
                      </button>
                      <div className="w-20 h-[106px] rounded-lg overflow-hidden bg-[#1a1a1a]">
                        <img
                          src={item.preview}
                          alt={item.title}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <p className="text-[11px] text-[#AAAAAA] mt-1 truncate">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* === UPLOADING / RECOGNIZING: 加载中 === */}
        {(status === STATUS.UPLOADING || status === STATUS.RECOGNIZING) && (
          <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
            {preview && (
              <div className="w-40 h-[214px] mx-auto mb-6 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="上传的海报"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
            )}
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#303030" strokeWidth="3" />
                <circle
                  cx="32" cy="32" r="28" fill="none" stroke="#6366F1" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  className="transition-[stroke-dashoffset] duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search size={18} strokeWidth={1.5} className="text-[#6366F1] animate-pulse" />
              </div>
            </div>
            <p className="text-white font-medium mb-1">
              {status === STATUS.UPLOADING ? '正在上传图片...' : '正在识别海报特征...'}
            </p>
            <p className="text-sm text-[#717171]">预计 5-10 秒</p>
          </div>
        )}

        {/* === SINGLE: 单结果 === */}
        {status === STATUS.SINGLE && results[0] && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className="text-[#10B981] text-lg">✓</span>
              <p className="text-[#10B981] font-medium">找到啦！为你识别出：</p>
              <span className="text-white font-bold">{results[0].title}</span>
            </div>
            <MovieResultCard movie={results[0]} onView={handleViewDetail} />
            <div className="flex justify-center mt-4">
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-full border border-[#404040] text-sm text-[#AAAAAA] hover:text-white hover:border-[#6366F1] transition-colors"
              >
                重新识别
              </button>
            </div>
          </div>
        )}

        {/* === MULTI: 多结果 === */}
        {status === STATUS.MULTI && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className="text-[#F59E0B] text-lg">⚠</span>
              <p className="text-[#F59E0B] font-medium">发现 {results.length} 个相关版本，请选择你想看的</p>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {results.map((movie, i) => (
                <MovieResultCard key={movie.id || i} movie={movie} onView={handleViewDetail} compact />
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-full border border-[#404040] text-sm text-[#AAAAAA] hover:text-white hover:border-[#6366F1] transition-colors"
              >
                重新识别
              </button>
            </div>
          </div>
        )}

        {/* === FAIL: 识别失败 === */}
        {(status === STATUS.FAIL_NOT_POSTER || status === STATUS.FAIL_BLURRY || status === STATUS.FAIL_ERROR) && (
          <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#272727] flex items-center justify-center mx-auto mb-4">
              {status === STATUS.FAIL_ERROR ? (
                <AlertCircle size={28} strokeWidth={1.5} className="text-[#EF4444]" />
              ) : (
                <Image size={28} strokeWidth={1.5} className="text-[#717171]" />
              )}
            </div>
            <p className="text-white font-medium mb-2">
              {status === STATUS.FAIL_NOT_POSTER ? '没认出这是哪部电影' : '图片有些模糊或角度不对'}
            </p>
            <p className="text-sm text-[#717171] mb-6">
              {status === STATUS.FAIL_NOT_POSTER
                ? '建议换一张更清晰的海报试试'
                : status === STATUS.FAIL_ERROR
                  ? errorMsg || '识别服务暂时不可用，请稍后再试'
                  : '试试重新上传，或直接输入片名搜索'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRetry}
                className="px-5 py-2 rounded-full bg-[#303030] text-white text-sm font-medium hover:bg-[#404040] transition-colors"
              >
                重新上传
              </button>
              <button
                onClick={() => { onClose(); }}
                className="px-5 py-2 rounded-full border border-[#404040] text-[#AAAAAA] text-sm hover:text-white hover:border-[#6366F1] transition-colors"
              >
                手动输入片名
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/** 电影结果卡片 */
function MovieResultCard({ movie, onView, compact = false }) {
  return (
    <div
      className={`bg-[#1a1a1a] rounded-xl overflow-hidden hover:bg-[#222] transition-colors cursor-pointer group ${
        compact ? 'flex' : ''
      }`}
      onClick={() => onView(movie.id)}
    >
      {compact ? (
        /* 紧凑横排布局（多结果） */
        <>
          <div className="w-[100px] h-[134px] flex-shrink-0 bg-[#0F0F0F] rounded-lg overflow-hidden">
            <PosterImg movieId={movie.id} title={movie.title} className="w-full h-full object-cover">
              <FallbackPoster />
            </PosterImg>
          </div>
          <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-white group-hover:text-[#6366F1] transition-colors truncate">
              {movie.title}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#AAAAAA]">
              {movie.rating && (
                <span className="flex items-center gap-1 text-[#F59E0B] font-medium">
                  <Star size={12} strokeWidth={1.5} className="fill-[#F59E0B]" />
                  {movie.rating}
                </span>
              )}
              {movie.year && (
                <span className="flex items-center gap-1">
                  <Clock size={11} strokeWidth={1.5} />
                  {movie.year}
                </span>
              )}
              {movie.director && (
                <span className="flex items-center gap-1">
                  <User size={11} strokeWidth={1.5} />
                  {movie.director}
                </span>
              )}
            </div>
            {movie.genre && (
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#303030] text-[11px] text-[#AAAAAA]">
                {movie.genre}
              </span>
            )}
          </div>
          <div className="flex items-center pr-4">
            <button
              onClick={(e) => { e.stopPropagation(); onView(movie.id); }}
              className="px-4 py-2 rounded-full bg-[#6366F1] text-white text-xs font-medium hover:bg-[#4F46E5] transition-colors whitespace-nowrap"
            >
              查看详情
            </button>
          </div>
        </>
      ) : (
        /* 单结果大卡片布局 */
        <>
          <div className="aspect-[3/2] bg-[#0F0F0F] overflow-hidden max-h-[280px]">
            <PosterImg movieId={movie.id} title={movie.title} className="w-full h-full object-contain">
              <div className="w-full h-full flex items-center justify-center">
                <Film size={48} strokeWidth={1.5} className="text-[#303030]" />
              </div>
            </PosterImg>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white group-hover:text-[#6366F1] transition-colors">
                  {movie.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#AAAAAA]">
                  {movie.rating && (
                    <span className="flex items-center gap-1 text-[#F59E0B] font-bold">
                      <Star size={14} strokeWidth={1.5} className="fill-[#F59E0B]" />
                      {movie.rating}
                    </span>
                  )}
                  {movie.year && (
                    <span className="flex items-center gap-1">
                      <Clock size={13} strokeWidth={1.5} />
                      {movie.year}
                    </span>
                  )}
                  {movie.director && (
                    <span className="flex items-center gap-1">
                      <User size={13} strokeWidth={1.5} />
                      {movie.director}
                    </span>
                  )}
                  {movie.duration && <span>{movie.duration}分钟</span>}
                  {movie.country && <span>{movie.country}</span>}
                </div>
                {movie.genre && (
                  <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-[#303030] text-xs text-[#AAAAAA]">
                    {movie.genre}
                  </span>
                )}
                {movie.description && (
                  <p className="text-sm text-[#AAAAAA] mt-3 line-clamp-3">{movie.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onView(movie.id); }}
              className="mt-4 w-full py-2.5 rounded-full bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] transition-colors flex items-center justify-center gap-2"
            >
              <Film size={16} strokeWidth={1.5} />
              查看详情
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 海报图片组件：始终尝试加载，加载失败自动显示 fallback children
 */
function PosterImg({ movieId, title, className, children }) {
  const [error, setError] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

  if (error || !movieId) {
    return children;
  }

  return (
    <img
      src={`${API_BASE}/posters/${movieId}`}
      alt={title || '电影海报'}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}

/** 小尺寸回退占位 */
function FallbackPoster() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Film size={24} strokeWidth={1.5} className="text-[#404040]" />
    </div>
  );
}
