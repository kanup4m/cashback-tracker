import React, { useState, useRef } from 'react';
import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
  Delete as DeleteIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Storage as StorageIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useTransactions } from '../../contexts/TransactionContext';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  exportToJSON,
  exportToCSV,
  importData,
  clearAllData,
  clearTransactions,
  createBackup,
  restoreFromBackup,
} from '../../utils/storage';
import { format } from 'date-fns';

import { ExportData } from '../../types';

const DataManagement: React.FC = () => {
  const { transactions, refreshTransactions } = useTransactions();
  const [deleteDialog, setDeleteDialog] = useState<'all' | 'transactions' | null>(null);
  const [importDialog, setImportDialog] = useState(false);
  const [importProgress, setImportProgress] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    try {
      const json = await exportToJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashback-data-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashback-transactions-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportDialog(true);
    setImportProgress(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);
      
      // Validate data structure
      if (!data.version || !data.transactions || !data.settings) {
        throw new Error('Invalid file format');
      }

      await importData(data);
      await refreshTransactions();
      
      setImportResult({
        success: true,
        message: `Successfully imported ${data.transactions.length} transactions`,
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
      });
    } finally {
      setImportProgress(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBackup = async () => {
    try {
      await createBackup();
      setImportResult({
        success: true,
        message: 'Backup created successfully',
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Backup failed',
      });
    }
  };

  const handleRestore = async () => {
    try {
      const success = await restoreFromBackup();
      if (success) {
        await refreshTransactions();
        setImportResult({
          success: true,
          message: 'Data restored from backup successfully',
        });
      } else {
        setImportResult({
          success: false,
          message: 'No backup found',
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Restore failed',
      });
    }
  };

  const handleClearData = async () => {
    try {
      if (deleteDialog === 'all') {
        await clearAllData();
      } else if (deleteDialog === 'transactions') {
        await clearTransactions();
      }
      await refreshTransactions();
      setDeleteDialog(null);
      setImportResult({
        success: true,
        message: 'Data cleared successfully',
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to clear data',
      });
    }
  };

  const getStorageSize = () => {
    // Estimate storage size (simplified)
    const jsonSize = JSON.stringify(transactions).length;
    const sizeInKB = (jsonSize / 1024).toFixed(2);
    return `${sizeInKB} KB`;
  };

  return (
    <>
      <Card
        title="Data Management"
        subtitle="Import, export, and manage your data"
        icon={<StorageIcon />}
      >
        <div className="space-y-4">
          {/* Storage Info */}
          <Alert severity="info">
            <div className="flex justify-between items-center">
              <span>Current data size: {getStorageSize()}</span>
              <span>{transactions.length} transactions</span>
            </div>
          </Alert>

          {/* Export Options */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Export Data
            </h4>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ExportIcon className="text-blue-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Export as JSON"
                  secondary="Complete backup including all settings"
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={handleExportJSON}
                    variant="outline"
                    size="sm"
                  >
                    Export
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <ExportIcon className="text-green-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Export as CSV"
                  secondary="Transaction data for spreadsheets"
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    size="sm"
                  >
                    Export
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </div>

          {/* Import Options */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Import Data
            </h4>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ImportIcon className="text-purple-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Import from JSON"
                  secondary="Restore from a previous export"
                />
                <ListItemSecondaryAction>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Button
                    onClick={handleImportClick}
                    variant="outline"
                    size="sm"
                  >
                    Import
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </div>

          {/* Backup & Restore */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Backup & Restore
            </h4>
            <List>
              <ListItem>
                <ListItemIcon>
                  <BackupIcon className="text-orange-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Create Backup"
                  secondary="Save current state locally"
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={handleBackup}
                    variant="outline"
                    size="sm"
                  >
                    Backup
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <RestoreIcon className="text-cyan-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Restore from Backup"
                  secondary="Restore last saved backup"
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={handleRestore}
                    variant="outline"
                    size="sm"
                  >
                    Restore
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </div>

          {/* Clear Data */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Clear Data
            </h4>
            <List>
              <ListItem>
                <ListItemIcon>
                  <DeleteIcon className="text-red-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Clear Transactions"
                  secondary="Delete all transaction data"
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={() => setDeleteDialog('transactions')}
                    variant="danger"
                    size="sm"
                  >
                    Clear
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <DeleteIcon className="text-red-500" />
                </ListItemIcon>
                <ListItemText
                  primary="Clear All Data"
                  secondary="Delete all data and settings"
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={() => setDeleteDialog('all')}
                    variant="danger"
                    size="sm"
                  >
                    Clear All
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog !== null}
        onClose={() => setDeleteDialog(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialog === 'all'
              ? 'This will permanently delete all your data including transactions and settings. This action cannot be undone.'
              : 'This will permanently delete all your transactions. Settings will be preserved. This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleClearData} variant="danger">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => !importProgress && setImportDialog(false)}>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          {importProgress && (
            <LinearProgress className="mb-4" />
          )}
          {importResult && (
            <Alert
              severity={importResult.success ? 'success' : 'error'}
              icon={importResult.success ? <CheckIcon /> : <ErrorIcon />}
            >
              {importResult.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setImportDialog(false)}
            variant="primary"
            disabled={importProgress}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DataManagement;