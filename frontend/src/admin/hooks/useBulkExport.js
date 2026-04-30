import { useMemo, useState } from 'react';
import { downloadZip } from '../exportUtils.js';
import { bulkExportModules, bulkExportOptions } from '../header/generateAdminHeaderData.js';

export default function useBulkExport(onActivity, onToast) {
  const [isOpen, setIsOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    modules: [],
    contents: ['csv'],
    dateFrom: '',
    dateTo: ''
  });

  const estimatedRecordCount = useMemo(() => {
    const base = bulkExportModules.filter((module) => form.modules.includes(module.id)).reduce((sum, module) => sum + module.recordEstimate, 0);
    if (!base) return 0;
    if (form.contents.includes('selectedOnly')) return Math.max(25, Math.round(base * 0.08));
    if (form.contents.includes('filteredOnly')) return Math.max(100, Math.round(base * 0.42));
    return base;
  }, [form]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    if (isRunning) return;
    setIsOpen(false);
    setError('');
  };

  const toggleModule = (moduleId) => {
    setForm((current) => ({
      ...current,
      modules: current.modules.includes(moduleId)
        ? current.modules.filter((id) => id !== moduleId)
        : [...current.modules, moduleId]
    }));
  };

  const toggleContent = (contentId) => {
    setForm((current) => ({
      ...current,
      contents: current.contents.includes(contentId)
        ? current.contents.filter((id) => id !== contentId)
        : [...current.contents, contentId]
    }));
  };

  const startExport = () => {
    if (!form.modules.length) {
      setError('Select at least one module before starting the ZIP export.');
      onToast?.('Export blocked', 'Choose at least one module to export.', 'error');
      return;
    }

    setError('');
    setIsRunning(true);
    setProgressOpen(true);
    setDownloadReady(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 20, 100);
        if (next >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setDownloadReady(true);
          onActivity?.({
            title: 'Bulk ZIP export prepared',
            meta: `${form.modules.length} modules · ${estimatedRecordCount.toLocaleString('en-IN')} records`,
            time: 'Just now',
            type: 'success'
          });
          onToast?.('ZIP export ready', `Prepared export for ${form.modules.length} modules.`, 'success');
        }
        return next;
      });
    }, 350);
  };

  const downloadArchive = () => {
    const files = form.modules.map((moduleId) => ({
      name: `${moduleId}-export-summary`,
      extension: 'txt',
      content: [
        `Module: ${moduleId}`,
        `Contents: ${form.contents.join(', ')}`,
        `Estimated records: ${estimatedRecordCount}`,
        `Date range: ${form.dateFrom || 'Any'} to ${form.dateTo || 'Any'}`
      ].join('\n')
    }));
    downloadZip('admin-bulk-export', files);
    setProgressOpen(false);
    setIsOpen(false);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    progressOpen,
    closeProgress: () => !isRunning && setProgressOpen(false),
    isRunning,
    progress,
    downloadReady,
    error,
    form,
    setForm,
    toggleModule,
    toggleContent,
    startExport,
    downloadArchive,
    estimatedRecordCount,
    modules: bulkExportModules,
    contentOptions: bulkExportOptions
  };
}
