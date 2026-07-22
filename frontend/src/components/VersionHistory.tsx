"use client";

import React from 'react';
import { History, X, Clock, RotateCcw, Eye, ChevronLeft } from 'lucide-react';
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
  onOpen,
  onClose,
  onRestore,
  onPreview,
}: VersionHistoryProps) {
  const list = Array.isArray(versions) ? versions : [];

  return (
    <>
      {/* Fixed Floating Right Edge Tab Trigger */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed right-0 top-24 z-40 bg-primary text-white pl-3 pr-4 py-2.5 rounded-l-xl shadow-2xl flex items-center gap-2 font-semibold text-xs tracking-wide hover:pr-5 transition-all duration-200 cursor-pointer border border-r-0 border-white/20 group"
          title="Open Version History"
        >
          <History className="w-4 h-4 text-white group-hover:rotate-[-45deg] transition-transform duration-300" />
          <span>History</span>
          {list.length > 0 && (
            <span className="bg-white text-primary text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {list.length}
            </span>
          )}
        </button>
      )}

      {/* Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-surface/95 backdrop-blur-2xl border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/20 rounded-lg text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-text text-sm">Version History</h2>
              <p className="text-[11px] text-text-muted">
                {list.length} {list.length === 1 ? 'snapshot' : 'snapshots'} logged
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors cursor-pointer"
            title="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-text-muted p-4">
              <div className="p-4 bg-surface-hover rounded-2xl mb-3">
                <Clock className="w-8 h-8 text-primary/60" />
              </div>
              <p className="font-semibold text-sm text-text">No version snapshots yet</p>
              <p className="text-xs text-text-muted mt-1 max-w-[200px]">
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
                    isCurrent ? 'border-primary' : 'border-border/60'
                  } last:pb-0 group`}
                >
                  <div
                    className={`absolute left-[-5px] top-1.5 w-2 h-2 rounded-full ${
                      isCurrent ? 'bg-primary ring-4 ring-primary/20' : 'bg-text-muted/40'
                    }`}
                  />

                  <div
                    className={`p-3 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-primary/10 border border-primary/30 shadow-xs'
                        : 'glass-panel hover:bg-surface-hover border border-border/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary/70" />
                        {v.created_at
                          ? new Date(v.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </span>

                      {isCurrent ? (
                        <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs font-semibold text-text mb-2">
                      {i === list.length - 1 ? 'Initial Generation' : `Version ${list.length - i}`}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                      <button
                        onClick={() => onPreview(v.id)}
                        className="text-[11px] text-text-muted hover:text-primary font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => onRestore(v.id)}
                          className="text-[11px] text-primary font-bold hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
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
