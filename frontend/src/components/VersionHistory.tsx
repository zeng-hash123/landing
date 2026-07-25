"use client";

import React from 'react';
import { History, X, Clock, RotateCcw, Eye } from 'lucide-react';
import { VersionEntry } from '../types';

interface VersionHistoryProps {
  versions: VersionEntry[];
  currentVersionId?: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRestore: (versionId: string) => void;
  onPreview: (versionId: string) => void;
}

export function VersionHistory({
  versions,
  currentVersionId,
  isOpen,
  onClose,
  onRestore,
  onPreview,
}: VersionHistoryProps) {
  const list = Array.isArray(versions) ? versions : [];

  return (
    <>
      {/* Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-84 bg-[#13131a]/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#13131a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-xl">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm tracking-tight">Version History</h2>
              <p className="text-[11px] text-gray-400">
                {list.length} {list.length === 1 ? 'snapshot' : 'snapshots'} logged
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 p-4">
              <div className="p-4 bg-[#161622] rounded-2xl mb-3 border border-white/5">
                <Clock className="w-7 h-7 text-violet-400/60" />
              </div>
              <p className="font-semibold text-sm text-white">No version snapshots yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                Generate a page or ask AI for edits to record version snapshots here.
              </p>
            </div>
          ) : (
            list.map((v, i) => {
              const isCurrent = v.id === currentVersionId;
              return (
                <div
                  key={v.id || i}
                  className={`relative pl-5 pb-3 border-l-2 ${
                    isCurrent ? 'border-violet-500' : 'border-white/10'
                  } last:pb-0 group`}
                >
                  <div
                    className={`absolute left-[-5px] top-1.5 w-2 h-2 rounded-full ${
                      isCurrent ? 'bg-violet-400 ring-4 ring-violet-500/20' : 'bg-gray-600'
                    }`}
                  />

                  <div
                    className={`p-3.5 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-violet-600/10 border border-violet-500/40 shadow-sm'
                        : 'bg-[#161622] hover:bg-[#1a1a28] border border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-violet-400" />
                        {v.created_at
                          ? new Date(v.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </span>

                      {isCurrent ? (
                        <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs font-semibold text-white mb-2">
                      {v.label || (i === list.length - 1 ? 'Initial Generation' : `Version ${list.length - i}`)}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => onPreview(v.id)}
                        className="text-[11px] text-gray-400 hover:text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => onRestore(v.id)}
                          className="text-[11px] text-violet-400 font-bold hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
