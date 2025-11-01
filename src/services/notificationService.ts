export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.permission = Notification.permission;
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    const defaultOptions: NotificationOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      ...options,
    };

    new Notification(title, defaultOptions);
  }

  // Test notification
  testNotification(): void {
    this.showNotification('Test Notification 🔔', {
      body: 'This is a test notification from Cashback Tracker!',
      tag: 'test-notification',
    });
  }

  // Daily reminder notifications
  showDailyReminder(): void {
    this.showNotification('Track Your Spending! 💰', {
      body: "Don't forget to log today's transactions and maximize your cashback!",
      tag: 'daily-reminder',
      icon: '/logo192.png',
      requireInteraction: false,
    });
  }

  // Cap warning notification
  showCapWarning(categoryName: string, percentage: number): void {
    this.showNotification('Cashback Cap Warning ⚠️', {
      body: `You've used ${percentage.toFixed(0)}% of your ${categoryName} cap!`,
      tag: 'cap-warning',
      icon: '/logo192.png',
    });
  }

  // Achievement unlocked
  showAchievement(title: string): void {
    this.showNotification('Achievement Unlocked! 🏆', {
      body: `Congratulations! You unlocked: ${title}`,
      tag: 'achievement',
      icon: '/logo192.png',
    });
  }

  // Cycle reset reminder
  showCycleReset(): void {
    this.showNotification('New Billing Cycle Started! 🔄', {
      body: 'Your cashback caps have been reset. Start tracking this cycle!',
      tag: 'cycle-reset',
      icon: '/logo192.png',
    });
  }

  // Weekly summary
  showWeeklySummary(cashback: number, transactions: number): void {
    this.showNotification('Weekly Summary 📊', {
      body: `This week: ₹${cashback.toFixed(2)} cashback from ${transactions} transactions`,
      tag: 'weekly-summary',
      icon: '/logo192.png',
    });
  }
}