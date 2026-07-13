/**
 * TokenDisplay — shows the event token prominently for admin.
 * token: 4-char alphanumeric string from backend
 */
export default function TokenDisplay({ token, isActive }) {
  const chars = token ? token.split('') : [];

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
        Token Absensi
      </p>

      {isActive && token ? (
        <>
          {/* Token character boxes */}
          <div className="flex gap-2 sm:gap-3">
            {chars.map((char, i) => (
              <div
                key={i}
                className="
                  flex items-center justify-center
                  w-11 h-14 sm:w-14 sm:h-18
                  rounded-xl border-2 border-primary/30
                  bg-gradient-to-b from-primary/5 to-primary/10
                  text-2xl sm:text-3xl font-extrabold text-primary
                  shadow-sm animate-fade-in
                "
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {char}
              </div>
            ))}
          </div>

          {/* Full token as copyable text */}
          <p className="text-xs text-gray-400 font-mono tracking-widest select-all">
            {token}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-11 h-14 sm:w-14 sm:h-18 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Aktifkan sesi untuk menampilkan token
          </p>
        </div>
      )}
    </div>
  );
}
