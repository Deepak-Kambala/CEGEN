import UploadZone from './UploadZone';
import { loadExcelFile } from '../utils/canvas';

export default function Step3({ fields, excelData, onExcelData, showToast, onBack, onNext }) {
  async function handleFile(file) {
    try {
      const rows = await loadExcelFile(file);
      if (!rows.length) { showToast('Excel file appears empty.'); return; }
      onExcelData(rows);
      showToast(`Loaded ${rows.length} rows.`);
    } catch (err) {
      showToast('Failed to read file: ' + err.message);
    }
  }

  const colsUpper = excelData.length
    ? Object.keys(excelData[0]).map(c => c.trim().toUpperCase())
    : [];

  const allMapped = fields.every(f => colsUpper.includes(f.name.trim().toUpperCase()));
  const previewRows = excelData.slice(0, 8);
  const previewCols = excelData.length ? Object.keys(excelData[0]) : [];

  return (
    <div className="panel">
      <div className="section-title">Upload Excel Data</div>
      <div className="section-sub">
        Upload an Excel or CSV file. The first row must contain column headers matching your field names.
      </div>

      <div className="excel-layout">
        <div>
          <UploadZone
            accept=".xlsx,.xls,.csv"
            onFile={handleFile}
            icon="[XLS]"
            title="Drop Excel / CSV here"
            subtitle="First row must be column headers"
            tags={['XLSX', 'XLS', 'CSV']}
            compact
          />
          <div style={{ marginTop: 14 }}>
            <div className="info-msg">
              Your file must have these columns:&nbsp;
              {fields.map(f => (
                <span key={f.id} className="tag" style={{ color: 'var(--gold)', marginLeft: 4 }}>
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          {excelData.length > 0 && (
            <>
              <div className="sidebar-card" style={{ marginBottom: 14 }}>
                <h3>Column Mapping</h3>
                <div className="field-mapping-list">
                  {fields.map(f => {
                    const found = colsUpper.includes(f.name.trim().toUpperCase());
                    return (
                      <div key={f.id} className="mapping-row">
                        <span className="mapping-label">{f.name}</span>
                        <span className={`mapping-status ${found ? 'ok' : 'err'}`}>
                          {found ? '✓ Found' : '✗ Missing'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sidebar-card">
                <h3>Data Preview</h3>
                <div className="preview-table-wrap">
                  <table>
                    <thead>
                      <tr>{previewCols.map(c => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i}>
                          {previewCols.map(c => <td key={c}>{row[c]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 7, fontSize: 10, color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>
                  {excelData.length} total rows (showing first 8)
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="btn-row" style={{ justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button
          className="btn-primary"
          disabled={excelData.length === 0 || !allMapped}
          onClick={onNext}
        >
          Next: Generate →
        </button>
      </div>
    </div>
  );
}
