/**
 * StatusBadge — shows event is_active status
 */
export default function StatusBadge({ isActive }) {
  return isActive ? (
    <span className="badge-active">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Aktif
    </span>
  ) : (
    <span className="badge-inactive">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Nonaktif
    </span>
  );
}

/**
 * AttendanceStatusBadge — shows attendance status (present / absent)
 */
export function AttendanceStatusBadge({ status }) {
  return status === 'present' ? (
    <span className="badge-present">Hadir</span>
  ) : (
    <span className="badge-absent">Tidak Hadir</span>
  );
}
