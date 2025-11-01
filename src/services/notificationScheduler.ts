import { NotificationService } from './notificationService';

interface ScheduleConfig {
  morningTime: string; // Format: "HH:MM"
  eveningTime: string; // Format: "HH:MM"
  enabled: boolean;
}

export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private morningInterval: NodeJS.Timeout | null = null;
  private eveningInterval: NodeJS.Timeout | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.loadScheduleAndStart();
  }

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  private getScheduleConfig(): ScheduleConfig {
    const saved = localStorage.getItem('notification_schedule');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      morningTime: '09:00',
      eveningTime: '18:00',
      enabled: true,
    };
  }

  saveScheduleConfig(config: ScheduleConfig): void {
    localStorage.setItem('notification_schedule', JSON.stringify(config));
    this.loadScheduleAndStart();
  }

  private loadScheduleAndStart(): void {
    this.stop();
    const config = this.getScheduleConfig();
    
    if (config.enabled) {
      this.start(config.morningTime, config.eveningTime);
    }
  }

  start(morningTime: string, eveningTime: string): void {
    console.log('Starting notification scheduler', { morningTime, eveningTime });
    
    // Check every minute if it's time to send notification
    this.checkInterval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const lastMorningNotif = localStorage.getItem('last_morning_notification');
      const lastEveningNotif = localStorage.getItem('last_evening_notification');
      const today = now.toDateString();

      // Morning notification
      if (currentTime === morningTime && lastMorningNotif !== today) {
        this.notificationService.showDailyReminder();
        localStorage.setItem('last_morning_notification', today);
      }

      // Evening notification
      if (currentTime === eveningTime && lastEveningNotif !== today) {
        this.notificationService.showDailyReminder();
        localStorage.setItem('last_evening_notification', today);
      }
    }, 60000); // Check every minute
  }

  stop(): void {
    if (this.morningInterval) {
      clearInterval(this.morningInterval);
      this.morningInterval = null;
    }
    if (this.eveningInterval) {
      clearInterval(this.eveningInterval);
      this.eveningInterval = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Manual trigger for testing
  triggerMorningNotification(): void {
    this.notificationService.showDailyReminder();
  }

  triggerEveningNotification(): void {
    this.notificationService.showDailyReminder();
  }
}