import { useState, useCallback } from "react";

const scoreColors = {
  5: "#27AE60", 4: "#5A8A2A", 3: "#E67E22", 2: "#E74C3C", 1: "#C0392B",
};
const levelColors = {
  Approaching: "#E67E22", Meeting: "#27AE60", Exceeding: "#1A3A5C",
};
const td = {
  padding: "14px 16px", verticalAlign: "top",
  borderBottom: "1px solid #E0D8CE", fontSize: 14, color: "#1A1A1A",
};

function ScoreBadge({ score }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 36, height: 36, borderRadius: "50%",
      background: scoreColors[score] || "#999", color: "#fff", fontWeight: 700, fontSize: 16,
    }}>
      {score}
    </span>
  );
}

function CCSSCell({ assessment }) {
  if (!assessment) return <td style={td}>—</td>;
  const { standards_met = [], areas_for_growth = [], ccss_level } = assessment;
  return (
    <td style={{ ...td, minWidth: 240 }}>
      <span style={{
        display: "inline-block", background: levelColors[ccss_level] || "#999",
        color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", padding: "2px 8px", borderRadius: 3, marginBottom: 8,
      }}>
        {ccss_level}
      </span>
      {standards_met.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#2D5016", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Standards Met</div>
          {standards_met.map((s, i) => (
            <div key={i} style={{ fontSize: 12, marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid #5A8A2A" }}>
              <span style={{ fontWeight: 700, color: "#2D5016" }}>{s.code}</span>
              <span style={{ color: "#6B6B6B" }}> — {s.note}</span>
            </div>
          ))}
        </div>
      )}
      {areas_for_growth.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#B05A00", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Areas for Growth</div>
          {areas_for_growth.map((a, i) => (
            <div key={i} style={{ fontSize: 12, marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid #E67E22" }}>
              <span style={{ fontWeight: 700, color: "#B05A00" }}>{a.code}</span>
              <span style={{ color: "#6B6B6B" }}> — {a.note}</span>
            </div>
          ))}
        </div>
      )}
    </td>
  );
}

function downloadCSV(students) {
  const headers = ["Student Name", "Written Text", "Spelling Score (/5)", "Observations", "CCSS Level", "Standards Met", "Areas for Growth"];
  const rows = students.map((s) => {
    const ccss = s.ccss_assessment || {};
    return [
      `"${s.student_name}"`,
      `"${s.written_text.replace(/"/g, '""')}"`,
      s.spelling_score,
      `"${s.observations.replace(/"/g, '""')}"`,
      `"${ccss.ccss_level || ""}"`,
      `"${(ccss.standards_met || []).map((x) => `${x.code}: ${x.note}`).join("; ").replace(/"/g, '""')}"`,
      `"${(ccss.areas_for_growth || []).map((x) => `${x.code}: ${x.note}`).join("; ").replace(/"/g, '""')}"`,
    ];
  });
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "student_writing_analysis.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);

  const processFile = async (file) => {
    if (!file || file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setFileName(file.name); setLoading(true); setError(""); setStudents([]);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Failed to read file"));
        r.readAsDataURL(file);
      });
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setStudents(data.students);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ marginBottom: 36 }}>
          <span style={{
            display: "inline-block", background: "#2D5016", color: "#fff",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: 3, marginBottom: 12,
          }}>Classroom Tool</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 400, color: "#1A1A1A", margin: "0 0 8px" }}>
            Student Writing Analyser
          </h1>
          <p style={{ color: "#6B6B6B", margin: 0, fontSize: 15 }}>
            Upload a scanned PDF of student writing samples to extract, analyse, and assess against{" "}
            <strong style={{ color: "#1A3A5C" }}>CCSS ELA Grades 6–8</strong> standards.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => document.getElementById("pdf-input").click()}
          style={{
            border: `2px dashed ${dragging ? "#2D5016" : "#E0D8CE"}`,
            borderRadius: 12, padding: "48px 32px", textAlign: "center", cursor: "pointer",
            background: dragging ? "#EAF2DC" : "#fff", transition: "all 0.2s", marginBottom: 28,
          }}
        >
          <input id="pdf-input" type="file" accept="application/pdf" style={{ display: "none" }}
            onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} />
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#1A1A1A", marginBottom: 6 }}>
            {fileName || "Drop a PDF here or click to browse"}
          </div>
          <div style={{ fontSize: 13, color: "#6B6B6B" }}>Supports scanned handwritten student writing samples</div>
        </div>

        {loading && (
          <div style={{ background: "#EAF2DC", border: "1px solid #5A8A2A", borderRadius: 8, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 20, height: 20, border: "2px solid #5A8A2A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "#2D5016", fontWeight: 600 }}>Analysing handwriting and assessing against CCSS ELA Grades 6–8…</span>
          </div>
        )}

        {error && (
          <div style={{ background: "#FDF0EF", border: "1px solid #C0392B", borderRadius: 8, padding: "16px 20px", color: "#C0392B", marginBottom: 24, fontSize: 14 }}>
            ⚠ {error}
          </div>
        )}

        {students.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E0D8CE", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E0D8CE" }}>
              <div>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 18 }}>
                  {students.length} student{students.length !== 1 ? "s" : ""} found
                </span>
                <span style={{ fontSize: 13, color: "#6B6B6B", marginLeft: 12 }}>
                  Avg. spelling: {(students.reduce((a, s) => a + s.spelling_score, 0) / students.length).toFixed(1)}/5
                </span>
              </div>
              <button onClick={() => downloadCSV(students)} style={{
                background: "#2D5016", color: "#fff", border: "none", borderRadius: 7,
                padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>↓ Download CSV</button>
            </div>

            <div style={{ padding: "10px 24px", background: "#E8F0F8", borderBottom: "1px solid #E0D8CE", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1A3A5C", textTransform: "uppercase", letterSpacing: "0.1em" }}>CCSS Level:</span>
              {[["Approaching", "#E67E22"], ["Meeting", "#27AE60"], ["Exceeding", "#1A3A5C"]].map(([label, color]) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[["Name","9%","#2D5016","#EAF2DC"],["Written Text","25%","#2D5016","#EAF2DC"],["Spelling","8%","#2D5016","#EAF2DC"],["Observations","20%","#2D5016","#EAF2DC"],["CCSS ELA Assessment · Grades 6–8","38%","#1A3A5C","#E8F0F8"]].map(([label, width, color, bg], i) => (
                      <th key={label} style={{
                        padding: "12px 16px", textAlign: i === 2 ? "center" : "left",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                        color, borderBottom: `2px solid ${color}`, background: bg,
                        fontFamily: "Georgia, serif", width,
                      }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAF7" }}>
                      <td style={td}>{s.student_name}</td>
                      <td style={{ ...td, fontFamily: "Georgia, serif", fontSize: 13, color: "#6B6B6B", lineHeight: 1.7, minWidth: 180 }}>{s.written_text}</td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <ScoreBadge score={s.spelling_score} />
                        <div style={{ fontSize: 11, color: "#6B6B6B", marginTop: 4 }}>/5</div>
                      </td>
                      <td style={{ ...td, fontSize: 13, color: "#6B6B6B", lineHeight: 1.6, minWidth: 160 }}>{s.observations}</td>
                      <CCSSCell assessment={s.ccss_assessment} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
