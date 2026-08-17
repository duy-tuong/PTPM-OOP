import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { formatDate } from "@/lib/utils";
import type { AdminAuditLogDto } from "@/lib/types/admin";

// AuditAction (Create/Update/Delete/StatusChange) chỉ dùng để hiển thị ở đây, không phải enum ghi
// dữ liệu nào - không cần thêm vào lib/types/enums.ts.
const ACTION_LABELS: Record<string, string> = {
  Create: "Tạo mới",
  Update: "Cập nhật",
  Delete: "Xoá",
  StatusChange: "Đổi trạng thái",
};

// OldValues/NewValues của các dòng do Order/Consultation/Affiliate tạo ra là tên enum thường (vd
// "New"), KHÔNG phải JSON (đã verify) - chỉ thử parse JSON để dự phòng cho các loại AuditLog khác
// trong hệ thống, không giả định JSON là mặc định.
function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function AuditValue({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-zinc-400">-</span>;

  const looksLikeJson = value.trimStart().startsWith("{") || value.trimStart().startsWith("[");
  const parsed = looksLikeJson ? tryParseJson(value) : undefined;

  if (parsed !== undefined) {
    return (
      <pre className="max-w-xs overflow-x-auto rounded-lg bg-zinc-50 p-2 text-xs text-zinc-700">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  }

  return <span className="text-zinc-700">{value}</span>;
}

export function AuditLogsTable({ logs }: { logs: AdminAuditLogDto[] }) {
  const columns: DataTableColumn<AdminAuditLogDto>[] = [
    {
      key: "timestamp",
      header: "Thời gian",
      cell: (row) => formatDate(row.timestamp),
    },
    {
      key: "user",
      header: "Người thực hiện",
      cell: (row) => row.userName ?? "Hệ thống",
    },
    {
      key: "action",
      header: "Hành động",
      cell: (row) => ACTION_LABELS[row.action] ?? row.action,
    },
    {
      key: "entity",
      header: "Đối tượng",
      cell: (row) => (
        <span className="font-mono text-xs">
          {row.entityName}#{row.entityId}
        </span>
      ),
    },
    {
      key: "oldValues",
      header: "Giá trị cũ",
      cell: (row) => <AuditValue value={row.oldValues} />,
    },
    {
      key: "newValues",
      header: "Giá trị mới",
      cell: (row) => <AuditValue value={row.newValues} />,
    },
  ];

  return (
    <DataTable columns={columns} data={logs} emptyMessage="Chưa có nhật ký nào." getRowKey={(row) => row.id} />
  );
}
