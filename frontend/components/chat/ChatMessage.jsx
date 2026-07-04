'use client';

import { Image, Play, Star } from 'lucide-react';

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="w-2 h-2 bg-[#717171] rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-[#717171] rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-[#717171] rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

function MiniMovieCard({ movie }) {
  return (
    <div className="flex items-center gap-2 bg-[#303030] rounded-lg p-2 mt-2">
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-10 h-14 object-cover rounded"
        />
      ) : (
        <div className="w-10 h-14 bg-[#0F0F0F] rounded flex items-center justify-center">
          <Play size={14} className="text-[#717171]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{movie.title}</p>
        {movie.year && (
          <p className="text-[10px] text-[#717171]">{movie.year}</p>
        )}
        {movie.rating && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={10} className="text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-[10px] text-[#F59E0B]">{movie.rating}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user';

  if (isStreaming && !message.content) {
    return (
      <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
        <div
          className={
            isUser
              ? 'bg-[#6366F1] rounded-2xl rounded-br-md'
              : 'bg-[#212121] rounded-2xl rounded-bl-md'
          }
        >
          <TypingDots />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const lines = message.content.split('\n');
    return lines.map((line, i) => (
      <span key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div className={isUser ? 'max-w-[80%] ml-auto' : 'max-w-[85%]'}>
        {/* Image preview */}
        {message.metadata?.imageUrl && (
          <div className="mb-2">
            <img
              src={message.metadata.imageUrl}
              alt="Uploaded"
              className="w-32 h-20 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Message bubble */}
        <div
          className={
            isUser
              ? 'bg-[#6366F1] text-white rounded-2xl rounded-br-md px-4 py-2'
              : 'bg-[#212121] text-white rounded-2xl rounded-bl-md px-4 py-2'
          }
        >
          {renderContent()}
        </div>

        {/* Mini movie cards */}
        {message.metadata?.movies && message.metadata.movies.length > 0 && (
          <div className="space-y-1">
            {message.metadata.movies.map((movie, idx) => (
              <MiniMovieCard key={movie.id || idx} movie={movie} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <p className="text-[10px] text-[#717171] mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
