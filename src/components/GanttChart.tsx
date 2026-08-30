import React, { useRef, useState } from 'react';
import { Node, Department } from '../types';
import { Download, X, Calendar, Layers, Clock, AlertCircle } from 'lucide-react';

interface GanttChartProps {
  nodes: Node[];
  departments?: Department[];
  simulatedDate: string;
}

const DEFAULT_DEPT_COLORS: Record<string, string> = {
  Teacher: '#c79016', // Golden Amber
  Hosts: '#883e66',   // Plum / Rosewood
  Research: '#3e6688', // Steel Blue
  Editing: '#b45f06',  // Warm Rust
  Admin: '#883712',    // Deep Sienna
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function GanttChart({ nodes, departments = [], simulatedDate }: GanttChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Build department color mapping
  const getDeptColor = (deptName: string) => {
    const found = departments.find(d => d.name.toLowerCase() === deptName.toLowerCase());
    if (found?.color) return found.color;
    if (DEFAULT_DEPT_COLORS[deptName]) return DEFAULT_DEPT_COLORS[deptName];
    return '#3e6688';
  };

  // --- Spacious Web App Dimensions ---
  const APP_DAY_WIDTH = 90;
  const APP_ROW_HEIGHT = 92;
  const APP_HEADER_HEIGHT = 70;
  const APP_LEFT_PANEL_WIDTH = 130;
  const APP_DEPT_HEADER_HEIGHT = 38;

  // Date Math Helpers
  const parseDate = (d: string) => new Date(d).getTime();
  const getDaysDiff = (start: string, end: string) => Math.round((parseDate(end) - parseDate(start)) / (1000 * 60 * 60 * 24));

  // Calculate timeline bounds
  let minTime = Infinity;
  let maxTime = -Infinity;
  const simulatedTime = parseDate(simulatedDate);

  if (nodes.length === 0) {
    minTime = simulatedTime - 7 * 24 * 60 * 60 * 1000;
    maxTime = simulatedTime + 7 * 24 * 60 * 60 * 1000;
  } else {
    nodes.forEach(n => {
      const ps = parseDate(n.planned_start);
      const pe = parseDate(n.planned_end);
      const as = n.actual_start ? parseDate(n.actual_start) : ps;
      const ae = n.actual_end ? parseDate(n.actual_end) : pe;
      minTime = Math.min(minTime, ps, as);
      maxTime = Math.max(maxTime, pe, ae);
    });
    minTime = Math.min(minTime, simulatedTime) - 2 * 24 * 60 * 60 * 1000; // Pad 2 days left
    maxTime = Math.max(maxTime, simulatedTime) + 5 * 24 * 60 * 60 * 1000; // Pad 5 days right
  }

  const totalDays = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24)) + 1);
  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(minTime + i * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  const getAppX = (dateStr: string) => APP_LEFT_PANEL_WIDTH + getDaysDiff(days[0], dateStr) * APP_DAY_WIDTH;
  const getAppW = (startStr: string, endStr: string) => (getDaysDiff(startStr, endStr) + 1) * APP_DAY_WIDTH;
  const appTotalWidth = APP_LEFT_PANEL_WIDTH + (totalDays * APP_DAY_WIDTH);

  // Group nodes by month for dual-tier date header
  const monthGroups: { monthLabel: string; startIdx: number; count: number }[] = [];
  days.forEach((dayStr, idx) => {
    const dateObj = new Date(dayStr);
    const label = `${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    if (monthGroups.length === 0 || monthGroups[monthGroups.length - 1].monthLabel !== label) {
      monthGroups.push({ monthLabel: label, startIdx: idx, count: 1 });
    } else {
      monthGroups[monthGroups.length - 1].count++;
    }
  });

  // Group nodes by department for Web App view & Export
  const grouped = nodes.reduce((acc, node) => {
    const deptKey = node.department || 'General';
    if (!acc[deptKey]) acc[deptKey] = [];
    acc[deptKey].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  // Render Web App Elements
  let appCurrentY = APP_HEADER_HEIGHT;
  const appSvgElements: React.JSX.Element[] = [];

  Object.entries(grouped).forEach(([dept, deptNodes]) => {
    const deptColor = getDeptColor(dept);

    // Department Section Header
    appSvgElements.push(
      <g key={`dept-${dept}`}>
        <rect x={0} y={appCurrentY} width={appTotalWidth} height={APP_DEPT_HEADER_HEIGHT} fill="#0d111a" fillOpacity="0.9" />
        <rect x={0} y={appCurrentY} width={4} height={APP_DEPT_HEADER_HEIGHT} fill={deptColor} />
        <text
          x={18}
          y={appCurrentY + 24}
          fill={deptColor}
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1"
        >
          // {dept.toUpperCase()} ({deptNodes.length})
        </text>
        <line x1={0} y1={appCurrentY + APP_DEPT_HEADER_HEIGHT} x2={appTotalWidth} y2={appCurrentY + APP_DEPT_HEADER_HEIGHT} stroke="#222b3d" strokeWidth="1" />
      </g>
    );
    appCurrentY += APP_DEPT_HEADER_HEIGHT;

    deptNodes.forEach(node => {
      const plannedX = getAppX(node.planned_start);
      const plannedW = getAppW(node.planned_start, node.planned_end);

      const actualStart = node.actual_start || node.planned_start;
      const actualEnd = node.actual_end || (node.status === 'In Progress' ? simulatedDate : actualStart);
      const actualX = getAppX(actualStart);
      const actualW = getAppW(actualStart, actualEnd);

      const bgColor = getDeptColor(node.department);
      const textColor = '#ffffff';

      let durationText = '';
      if (node.actual_start) {
        const numDays = getDaysDiff(node.actual_start, node.actual_end || simulatedDate) + 1;
        durationText = node.actual_end ? `${numDays}d` : `${numDays}d (active)`;
      }

      appSvgElements.push(
        <g key={`node-${node.id}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedNode(node)}>
          {/* Row Background & Divider */}
          <rect x={0} y={appCurrentY} width={appTotalWidth} height={APP_ROW_HEIGHT} fill="none" />
          <line x1={0} y1={appCurrentY + APP_ROW_HEIGHT} x2={appTotalWidth} y2={appCurrentY + APP_ROW_HEIGHT} stroke="#171e2c" strokeWidth="1" />

          {/* Left Panel ID */}
          <rect x={0} y={appCurrentY} width={APP_LEFT_PANEL_WIDTH} height={APP_ROW_HEIGHT} fill="#0d111a" fillOpacity="0.95" />
          <text x={16} y={appCurrentY + 58} fill="#94a3b8" fontSize="13" fontFamily="monospace" fontWeight="bold">{node.id}</text>
          <line x1={APP_LEFT_PANEL_WIDTH} y1={appCurrentY} x2={APP_LEFT_PANEL_WIDTH} y2={appCurrentY + APP_ROW_HEIGHT} stroke="#222b3d" strokeWidth="1" />

          {/* Task Name Title */}
          <text
            x={plannedX}
            y={appCurrentY + 30}
            fill="#ffffff"
            fontSize="14"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
          >
            {node.title} {node.dependency && `[Dep: ${node.dependency}]`}
          </text>

          {/* Planned Container Bar */}
          <rect
            x={plannedX}
            y={appCurrentY + 38}
            width={plannedW}
            height={14}
            fill="#222b3d"
            rx="6"
          />

          {/* Actual Progress Bar & Duration Text */}
          {node.actual_start && (
            <g>
              <rect
                x={actualX}
                y={appCurrentY + 56}
                width={actualW}
                height={26}
                fill={bgColor}
                rx="8"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
              />
              <text
                x={actualX + 12}
                y={appCurrentY + 74}
                fill={textColor}
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {durationText}
              </text>
            </g>
          )}
        </g>
      );
      appCurrentY += APP_ROW_HEIGHT;
    });
  });

  const appTotalHeight = appCurrentY;
  const appSimulatedX = getAppX(simulatedDate) + (APP_DAY_WIDTH / 2);

  // --- SVG Export ---
  const handleExport = () => {
    const EXPORT_DAY_WIDTH = 130;
    const EXPORT_ROW_HEIGHT = 160;
    const EXPORT_HEADER_HEIGHT = 110;
    const EXPORT_LEFT_PANEL_WIDTH = 220;
    const EXPORT_DEPT_HEADER_HEIGHT = 56;

    const escapeXml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const getExportX = (dateStr: string) => EXPORT_LEFT_PANEL_WIDTH + getDaysDiff(days[0], dateStr) * EXPORT_DAY_WIDTH;
    const getExportW = (startStr: string, endStr: string) => (getDaysDiff(startStr, endStr) + 1) * EXPORT_DAY_WIDTH;
    const exportTotalWidth = EXPORT_LEFT_PANEL_WIDTH + (totalDays * EXPORT_DAY_WIDTH);

    let exportY = EXPORT_HEADER_HEIGHT;
    const exportElements: string[] = [];

    // Header Divider
    exportElements.push(`
      <line x1="0" y1="${EXPORT_HEADER_HEIGHT}" x2="${exportTotalWidth}" y2="${EXPORT_HEADER_HEIGHT}" stroke="#222b3d" stroke-width="3"/>
    `);

    // Month Groups
    monthGroups.forEach(mg => {
      const startX = EXPORT_LEFT_PANEL_WIDTH + mg.startIdx * EXPORT_DAY_WIDTH;
      const width = mg.count * EXPORT_DAY_WIDTH;
      exportElements.push(`
        <rect x="${startX}" y="0" width="${width}" height="44" fill="#0d111a" stroke="#222b3d" stroke-width="2"/>
        <text x="${startX + width / 2}" y="30" fill="#94a3b8" font-size="22" font-family="sans-serif" font-weight="bold" letter-spacing="2" text-anchor="middle">${escapeXml(mg.monthLabel)}</text>
      `);
    });

    days.forEach((day, i) => {
      const dateObj = new Date(day);
      const dayNum = dateObj.getDate();
      const dayName = DAY_NAMES[dateObj.getDay()];
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      const x = EXPORT_LEFT_PANEL_WIDTH + i * EXPORT_DAY_WIDTH;

      if (isWeekend) {
        exportElements.push(`
          <rect x="${x}" y="${EXPORT_HEADER_HEIGHT}" width="${EXPORT_DAY_WIDTH}" height="99999" fill="#0b0e14" opacity="0.5"/>
        `);
      }

      exportElements.push(`
        <text x="${x + EXPORT_DAY_WIDTH / 2}" y="82" fill="${isWeekend ? '#f87171' : '#94a3b8'}" font-size="24" font-family="sans-serif" font-weight="bold" text-anchor="middle">${dayNum} ${dayName}</text>
        <line x1="${x}" y1="${EXPORT_HEADER_HEIGHT}" x2="${x}" y2="99999" stroke="#171e2c" stroke-width="2"/>
      `);
    });

    // Sections
    Object.entries(grouped).forEach(([dept, deptNodes]) => {
      const deptColor = getDeptColor(dept);
      exportElements.push(`
        <rect x="0" y="${exportY}" width="${exportTotalWidth}" height="${EXPORT_DEPT_HEADER_HEIGHT}" fill="#0d111a"/>
        <rect x="0" y="${exportY}" width="8" height="${EXPORT_DEPT_HEADER_HEIGHT}" fill="${deptColor}"/>
        <text x="30" y="${exportY + 38}" fill="${deptColor}" font-size="28" font-family="sans-serif" font-weight="bold" letter-spacing="2">// ${escapeXml(dept.toUpperCase())}</text>
        <line x1="0" y1="${exportY + EXPORT_DEPT_HEADER_HEIGHT}" x2="${exportTotalWidth}" y2="${exportY + EXPORT_DEPT_HEADER_HEIGHT}" stroke="#222b3d" stroke-width="3"/>
      `);
      exportY += EXPORT_DEPT_HEADER_HEIGHT;

      deptNodes.forEach(node => {
        const plannedX = getExportX(node.planned_start);
        const plannedW = getExportW(node.planned_start, node.planned_end);
        const actualStart = node.actual_start || node.planned_start;
        const actualEnd = node.actual_end || (node.status === 'In Progress' ? simulatedDate : actualStart);
        const actualX = getExportX(actualStart);
        const actualW = getExportW(actualStart, actualEnd);

        const bgColor = getDeptColor(node.department);
        const textColor = '#ffffff';

        let durationText = '';
        if (node.actual_start) {
          const numDays = getDaysDiff(node.actual_start, node.actual_end || simulatedDate) + 1;
          durationText = node.actual_end ? `${numDays}d` : `${numDays}d (ip)`;
        }

        const titleText = `${node.title}${node.dependency ? ` [Dep: ${node.dependency}]` : ''}`;

        exportElements.push(`
          <g>
            <line x1="0" y1="${exportY + EXPORT_ROW_HEIGHT}" x2="${exportTotalWidth}" y2="${exportY + EXPORT_ROW_HEIGHT}" stroke="#171e2c" stroke-width="2"/>
            <rect x="0" y="${exportY}" width="${EXPORT_LEFT_PANEL_WIDTH}" height="${EXPORT_ROW_HEIGHT}" fill="#0d111a"/>
            <text x="30" y="${exportY + 95}" fill="#94a3b8" font-size="32" font-family="monospace" font-weight="bold">${escapeXml(node.id)}</text>
            <line x1="${EXPORT_LEFT_PANEL_WIDTH}" y1="${exportY}" x2="${EXPORT_LEFT_PANEL_WIDTH}" y2="${exportY + EXPORT_ROW_HEIGHT}" stroke="#222b3d" stroke-width="3"/>

            <text x="${plannedX}" y="${exportY + 50}" fill="#ffffff" font-size="46" font-family="sans-serif" font-weight="bold">${escapeXml(titleText)}</text>
            <rect x="${plannedX}" y="${exportY + 64}" width="${plannedW}" height="22" fill="#222b3d" rx="8"/>
            ${node.actual_start ? `
              <rect x="${actualX}" y="${exportY + 94}" width="${actualW}" height="48" fill="${bgColor}" rx="10"/>
              <text x="${actualX + 16}" y="${exportY + 130}" fill="${textColor}" font-size="34" font-family="sans-serif" font-weight="bold">${escapeXml(durationText)}</text>
            ` : ''}
          </g>
        `);
        exportY += EXPORT_ROW_HEIGHT;
      });
    });

    const exportSimulatedX = getExportX(simulatedDate) + (EXPORT_DAY_WIDTH / 2);
    exportElements.push(`
      <g>
        <line x1="${exportSimulatedX}" y1="${EXPORT_HEADER_HEIGHT}" x2="${exportSimulatedX}" y2="${exportY}" stroke="#c79016" stroke-width="6" stroke-dasharray="14,14"/>
        <rect x="${exportSimulatedX - 80}" y="${EXPORT_HEADER_HEIGHT + 10}" width="160" height="42" fill="#c79016" rx="10"/>
        <text x="${exportSimulatedX}" y="${EXPORT_HEADER_HEIGHT + 38}" fill="#000000" font-size="22" font-family="sans-serif" font-weight="bold" text-anchor="middle">TODAY</text>
      </g>
    `);

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${exportTotalWidth} ${exportY}" width="${exportTotalWidth}" height="${exportY}" style="background-color: #0b0e14;">
        ${exportElements.join('')}
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'isha-vibes-production-gantt.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#121620] border border-[#222b3d] rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="p-4 border-b border-[#222b3d] flex justify-between items-center bg-[#161b26] shrink-0">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white font-sans">
            PRODUCTION ROADMAP & GANTT ENGINE
          </h2>
          <span className="text-[10px] text-slate-400 font-sans">
            Interactive Timeline & Multi-Department Milestone Visualizer
          </span>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 text-xs font-medium bg-[#181e2b] hover:bg-[#20283a] text-slate-200 border border-[#222b3d] px-3.5 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT SVG
        </button>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 overflow-auto bg-[#0b0e14] relative">
        <svg
          ref={svgRef}
          width={appTotalWidth}
          height={appTotalHeight}
          className="select-none font-sans"
        >
          {/* Header Background */}
          <rect x={0} y={0} width={appTotalWidth} height={APP_HEADER_HEIGHT} fill="#0d111a" />
          <line x1={0} y1={APP_HEADER_HEIGHT} x2={appTotalWidth} y2={APP_HEADER_HEIGHT} stroke="#222b3d" strokeWidth="1" />

          {/* Month Group Headers */}
          {monthGroups.map(mg => {
            const startX = APP_LEFT_PANEL_WIDTH + mg.startIdx * APP_DAY_WIDTH;
            const width = mg.count * APP_DAY_WIDTH;
            return (
              <g key={`month-${mg.monthLabel}`}>
                <rect x={startX} y={0} width={width} height={30} fill="#0d111a" stroke="#222b3d" strokeWidth="1" />
                <text
                  x={startX + width / 2}
                  y={20}
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {mg.monthLabel}
                </text>
              </g>
            );
          })}

          {/* Days Headers */}
          {days.map((day, i) => {
            const dateObj = new Date(day);
            const dayNum = dateObj.getDate();
            const dayName = DAY_NAMES[dateObj.getDay()];
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const x = APP_LEFT_PANEL_WIDTH + i * APP_DAY_WIDTH;

            return (
              <g key={`day-${day}`}>
                {isWeekend && (
                  <rect x={x} y={APP_HEADER_HEIGHT} width={APP_DAY_WIDTH} height={appTotalHeight - APP_HEADER_HEIGHT} fill="#0d111a" opacity="0.6" />
                )}
                <text
                  x={x + APP_DAY_WIDTH / 2}
                  y={54}
                  fill={isWeekend ? '#f87171' : '#94a3b8'}
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {dayNum} {dayName}
                </text>
                <line x1={x} y1={APP_HEADER_HEIGHT} x2={x} y2={appTotalHeight} stroke="#171e2c" strokeWidth="1" />
              </g>
            );
          })}

          {/* Render All Node Elements */}
          {appSvgElements}

          {/* TODAY Line */}
          <g>
            <line x1={appSimulatedX} y1={APP_HEADER_HEIGHT} x2={appSimulatedX} y2={appTotalHeight} stroke="#c79016" strokeWidth="2.5" strokeDasharray="6,6" />
            <rect x={appSimulatedX - 32} y={APP_HEADER_HEIGHT + 6} width={64} height={20} fill="#c79016" rx="6" />
            <text x={appSimulatedX} y={APP_HEADER_HEIGHT + 20} fill="#000000" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">TODAY</text>
          </g>
        </svg>
      </div>

      {/* Selected Task Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-white px-2.5 py-1 rounded-lg bg-[#3e6688]/20 border border-[#3e6688]/40">
                  {selectedNode.id}
                </span>
                <h3 className="text-sm font-bold text-white font-sans">{selectedNode.title}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Description</span>
                <p className="text-sm text-slate-200 mt-1 bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d] leading-relaxed">
                  {selectedNode.description || 'No additional details recorded for this task.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d]">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Department</span>
                  <span className="text-xs font-bold text-white mt-1 block">{selectedNode.department}</span>
                </div>
                <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d]">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Status</span>
                  <span className="text-xs font-bold text-white mt-1 block">{selectedNode.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d]">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Planned Target</span>
                  <span className="text-xs font-mono text-slate-300 mt-1 block">{selectedNode.planned_start} to {selectedNode.planned_end}</span>
                </div>
                <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d]">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Actual Timeline</span>
                  <span className="text-xs font-mono text-slate-300 mt-1 block">
                    {selectedNode.actual_start ? `${selectedNode.actual_start} to ${selectedNode.actual_end || 'In Progress'}` : 'Not yet deployed'}
                  </span>
                </div>
              </div>

              {selectedNode.dependency && (
                <div className="bg-[#3e6688]/10 p-3 rounded-xl border border-[#3e6688]/30">
                  <span className="text-[10px] font-mono uppercase text-[#9dbcd4] block">Prerequisite Dependency</span>
                  <span className="text-xs font-bold text-white mt-1 block">{selectedNode.dependency}</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#222b3d] bg-[#161b26] flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#181e2b] hover:bg-[#20283a] border border-[#222b3d]"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
