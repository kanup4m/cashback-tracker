import React, { useState, useEffect } from 'react';
import {
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as ActiveIcon,
  NotificationsOff as OffIcon,
  Science as TestIcon,
} from '@mui/icons-material';
import Card from '../common/Card';
import Button from '../common/Button';
import { NotificationService } from '../../services/notificationService';
import { NotificationScheduler } from '../../services/notificationScheduler';
import { useToast } from '../common/Toast';

const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('09:00');
  const [eveningTime, setEveningTime] = useState('18:00');
  const toast = useToast();

  const notificationService = NotificationService.getInstance();
  const scheduler = NotificationScheduler.getInstance();

  useEffect(() => {
    setPermission(Notification.permission);
    
    // Load saved schedule
    const saved = localStorage.getItem('notification_schedule');
    if (saved) {
      const config = JSON.parse(saved);
      setEnabled(config.enabled);
      setMorningTime(config.morningTime);
      setEveningTime(config.eveningTime);
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(Notification.permission);
    
    if (granted) {
      toast.success('Notification permission granted!');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleTestNotification = () => {
    notificationService.testNotification();
    toast.success('Test notification sent!');
  };

  const handleTestMorning = () => {
    scheduler.triggerMorningNotification();
    toast.success('Morning notification sent!');
  };

  const handleTestEvening = () => {
    scheduler.triggerEveningNotification();
    toast.success('Evening notification sent!');
  };

  const handleSaveSchedule = () => {
    scheduler.saveScheduleConfig({
      morningTime,
      eveningTime,
      enabled,
    });
    toast.success('Notification schedule saved!');
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'success', icon: <ActiveIcon />, text: 'Enabled' };
      case 'denied':
        return { color: 'error', icon: <OffIcon />, text: 'Blocked' };
      default:
        return { color: 'warning', icon: <NotificationsIcon />, text: 'Not Set' };
    }
  };

  const status = getPermissionStatus();

  return (
    <div className="space-y-6">
      <Card
        title="Browser Notifications"
        subtitle="Stay updated with daily reminders and alerts"
        icon={<NotificationsIcon />}
      >
        {/* Permission Status */}
        <Alert 
          severity={status.color as any} 
          icon={status.icon}
          className="mb-4"
        >
          <div className="flex justify-between items-center">
            <span>
              Notification Permission: <strong>{status.text}</strong>
            </span>
            {permission !== 'granted' && (
              <Button
                onClick={handleRequestPermission}
                variant="primary"
                size="sm"
              >
                Enable Notifications
              </Button>
            )}
          </div>
        </Alert>

        {/* Test Notifications */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            Test Notifications
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleTestNotification}
              variant="outline"
              size="sm"
              icon={<TestIcon />}
              disabled={permission !== 'granted'}
            >
              Test Basic
            </Button>
            <Button
              onClick={handleTestMorning}
              variant="outline"
              size="sm"
              icon={<TestIcon />}
              disabled={permission !== 'granted'}
            >
              Test Morning
            </Button>
            <Button
              onClick={handleTestEvening}
              variant="outline"
              size="sm"
              icon={<TestIcon />}
              disabled={permission !== 'granted'}
            >
              Test Evening
            </Button>
            <Button
              onClick={() => notificationService.showCapWarning('Food & Grocery', 85)}
              variant="outline"
              size="sm"
              icon={<TestIcon />}
              disabled={permission !== 'granted'}
            >
              Test Warning
            </Button>
            <Button
              onClick={() => notificationService.showAchievement('First Transaction')}
              variant="outline"
              size="sm"
              icon={<TestIcon />}
              disabled={permission !== 'granted'}
            >
              Test Achievement
            </Button>
          </div>
        </div>

        <Divider className="my-6" />

        {/* Daily Schedule */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            Daily Reminder Schedule
          </h4>

          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
            }
            label="Enable daily reminders (twice a day)"
            className="mb-4"
          />

          {enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Morning Reminder
                  </label>
                  <TextField
                    type="time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Reminder to log morning transactions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Evening Reminder
                  </label>
                  <TextField
                    type="time"
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Reminder to log evening transactions
                  </p>
                </div>
              </div>

              <Alert severity="info">
                <strong>Note:</strong> Notifications will only appear when this browser tab is open 
                or you have the app installed as a PWA.
              </Alert>

              <Button
                onClick={handleSaveSchedule}
                variant="primary"
                fullWidth
              >
                Save Schedule
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Types */}
      <Card
        title="Notification Types"
        subtitle="Types of notifications you'll receive"
      >
        <div className="space-y-3">
          {[
            { icon: '🔔', title: 'Daily Reminders', desc: 'Twice daily reminders to log transactions' },
            { icon: '⚠️', title: 'Cap Warnings', desc: 'Alert when approaching cashback limits' },
            { icon: '🏆', title: 'Achievements', desc: 'Notifications for unlocked achievements' },
            { icon: '🔄', title: 'Cycle Reset', desc: 'Alert when billing cycle resets' },
            { icon: '📊', title: 'Weekly Summary', desc: 'Weekly cashback performance summary' },
          ].map((type, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-2xl">{type.icon}</span>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                  {type.title}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;