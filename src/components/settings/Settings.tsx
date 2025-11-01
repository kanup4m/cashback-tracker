import React, { useState } from 'react';
import {
  TextField,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Slider,
  Divider,
  Alert,
  Snackbar,
  RadioGroup,
  Radio,
  FormLabel,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';
import { Settings as SettingsType, CycleType } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import DataManagement from './DataManagement';
import NotificationSettings from './NotificationSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <div className="py-6">{children}</div>}
    </div>
  );
};

const Settings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { settings, updateSettings, resetSettings, loading } = useSettings();
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleChange = (field: keyof SettingsType | string, value: any) => {
    if (field.includes('.')) {
      // Handle nested fields like notifications.capWarning
      const [parent, child] = field.split('.');
      setLocalSettings({
        ...localSettings,
        [parent]: {
          ...(localSettings as any)[parent],
          [child]: value,
        },
      });
    } else {
      setLocalSettings({
        ...localSettings,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setSaveSuccess(true);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }
    
    try {
      await resetSettings();
      const defaultSettings = settings;
      setLocalSettings(defaultSettings);
      setResetConfirm(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your cashback tracker experience
        </p>
      </div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="bg-white dark:bg-gray-800 rounded-t-xl">
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label="General" 
            icon={<SettingsIcon />} 
            iconPosition="start"
            id="settings-tab-0"
            aria-controls="settings-tabpanel-0"
          />
          <Tab 
            label="Notifications" 
            icon={<NotificationsIcon />} 
            iconPosition="start"
            id="settings-tab-1"
            aria-controls="settings-tabpanel-1"
          />
          <Tab 
            label="Appearance" 
            icon={<PaletteIcon />} 
            iconPosition="start"
            id="settings-tab-2"
            aria-controls="settings-tabpanel-2"
          />
          <Tab 
            label="Data & Privacy" 
            icon={<StorageIcon />} 
            iconPosition="start"
            id="settings-tab-3"
            aria-controls="settings-tabpanel-3"
          />
        </Tabs>
      </Box>

      {/* Tab Panel 0: General Settings */}
      <TabPanel value={currentTab} index={0}>
        <div className="space-y-6">
          {/* Billing Cycle Settings */}
          <Card
            title="Billing Cycle"
            subtitle="Configure default cycle preferences"
            icon={<SettingsIcon />}
          >
            <div className="space-y-4">
              <FormControl fullWidth>
                <InputLabel>Default Cycle Type</InputLabel>
                <Select
                  value={localSettings.defaultCycle}
                  onChange={(e) => handleChange('defaultCycle', e.target.value as CycleType)}
                  label="Default Cycle Type"
                >
                  <MenuItem value="STATEMENT">Statement Cycle</MenuItem>
                  <MenuItem value="CALENDAR">Calendar Month</MenuItem>
                  <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                  <MenuItem value="CUSTOM">Custom Range</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Statement Cycle Date"
                value={localSettings.statementCycleDate}
                onChange={(e) => handleChange('statementCycleDate', parseInt(e.target.value))}
                helperText="Day of month when statement cycle starts (1-31)"
                InputProps={{
                  inputProps: { min: 1, max: 31 }
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={localSettings.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                  label="Date Format"
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Currency Symbol"
                value={localSettings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                helperText="Currency symbol to display (e.g., ₹, $, €)"
              />
            </div>
          </Card>

          {/* In-App Notification Preferences */}
          <Card
            title="In-App Notifications"
            subtitle="Configure alerts and reminders within the app"
            icon={<NotificationsIcon />}
          >
            <div className="space-y-4">
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.notifications.capWarning}
                    onChange={(e) => handleChange('notifications.capWarning', e.target.checked)}
                  />
                }
                label="Cap Warning Notifications"
              />

              {localSettings.notifications.capWarning && (
                <div className="ml-8">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Warning Threshold: {localSettings.notifications.capWarningThreshold}%
                  </p>
                  <Slider
                    value={localSettings.notifications.capWarningThreshold}
                    onChange={(e, value) => handleChange('notifications.capWarningThreshold', value as number)}
                    min={50}
                    max={95}
                    step={5}
                    marks={[
                      { value: 50, label: '50%' },
                      { value: 70, label: '70%' },
                      { value: 80, label: '80%' },
                      { value: 90, label: '90%' },
                      { value: 95, label: '95%' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </div>
              )}

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.notifications.dailySummary}
                    onChange={(e) => handleChange('notifications.dailySummary', e.target.checked)}
                  />
                }
                label="Daily Summary"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.notifications.weeklySummary}
                    onChange={(e) => handleChange('notifications.weeklySummary', e.target.checked)}
                  />
                }
                label="Weekly Summary"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.notifications.cycleReset}
                    onChange={(e) => handleChange('notifications.cycleReset', e.target.checked)}
                  />
                }
                label="Cycle Reset Reminder"
              />
            </div>
          </Card>
        </div>
      </TabPanel>

      {/* Tab Panel 1: Notifications */}
      <TabPanel value={currentTab} index={1}>
        <NotificationSettings />
      </TabPanel>

      {/* Tab Panel 2: Appearance */}
      <TabPanel value={currentTab} index={2}>
        <Card
          title="Appearance"
          subtitle="Customize the look and feel"
          icon={<PaletteIcon />}
        >
          <div className="space-y-4">
            <FormControl component="fieldset">
              <FormLabel component="legend">Theme</FormLabel>
              <RadioGroup
                value={localSettings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <FormControlLabel 
                  value="light" 
                  control={<Radio />} 
                  label={
                    <div>
                      <div className="font-medium">Light</div>
                      <div className="text-sm text-gray-500">Classic bright theme</div>
                    </div>
                  }
                />
                <FormControlLabel 
                  value="dark" 
                  control={<Radio />} 
                  label={
                    <div>
                      <div className="font-medium">Dark</div>
                      <div className="text-sm text-gray-500">Easy on the eyes</div>
                    </div>
                  }
                />
                <FormControlLabel 
                  value="auto" 
                  control={<Radio />} 
                  label={
                    <div>
                      <div className="font-medium">Auto (System)</div>
                      <div className="text-sm text-gray-500">Matches your system preferences</div>
                    </div>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Divider />

            <Alert severity="info">
              Theme changes apply immediately across the entire application.
            </Alert>
          </div>
        </Card>
      </TabPanel>

      {/* Tab Panel 3: Data & Privacy */}
      <TabPanel value={currentTab} index={3}>
        <div className="space-y-6">
          {/* Data Management */}
          <DataManagement />

          {/* Privacy & Security */}
          <Card
            title="Privacy & Security"
            subtitle="Manage your data privacy"
            icon={<SecurityIcon />}
          >
            <div className="space-y-4">
              <Alert severity="info">
                All your data is stored locally on your device. No data is sent to any external servers.
              </Alert>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Data Storage Location
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your transaction data is stored in your browser's IndexedDB storage.
                  This data persists across browser sessions but is only accessible from this website.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Data Backup
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Regular backups are recommended to prevent data loss.
                  You can export your data from the Data Management section above.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Browser Storage Usage
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This app uses IndexedDB, LocalStorage, and Service Workers for offline functionality.
                  Your data never leaves your device unless you explicitly export it.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </TabPanel>

      {/* Action Buttons - Show only on General and Appearance tabs */}
      {(currentTab === 0 || currentTab === 2) && (
        <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <Button
            onClick={handleReset}
            variant={resetConfirm ? 'danger' : 'outline'}
            icon={<ResetIcon />}
          >
            {resetConfirm ? 'Click again to confirm reset' : 'Reset to Defaults'}
          </Button>

          <Button
            onClick={handleSave}
            variant="primary"
            icon={<SaveIcon />}
            loading={loading}
          >
            Save Settings
          </Button>
        </div>
      )}

      {/* Success Notification */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success">
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings;