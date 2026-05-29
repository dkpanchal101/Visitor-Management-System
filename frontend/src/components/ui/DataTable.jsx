export function DataTable({ children, className = "" }) {
  return (
    <div className={`data-table-wrap ${className}`}>
      <table className="data-table">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }) {
  return <thead className="data-table-head">{children}</thead>;
}

export function DataTableBody({ children }) {
  return <tbody className="data-table-body">{children}</tbody>;
}

export function Th({ children, className = "" }) {
  return <th className={className}>{children}</th>;
}

export function Td({ children, className = "", colSpan }) {
  return (
    <td className={className} colSpan={colSpan}>
      {children}
    </td>
  );
}

export function TableRow({ children, className = "" }) {
  return <tr className={className}>{children}</tr>;
}

export function TableEmpty({ colSpan, children = "No records found" }) {
  return (
    <TableRow>
      <Td colSpan={colSpan} className="data-table-empty">
        {children}
      </Td>
    </TableRow>
  );
}

export function TableLoading({ colSpan }) {
  return (
    <TableRow>
      <Td colSpan={colSpan} className="data-table-empty">
        Loading…
      </Td>
    </TableRow>
  );
}
