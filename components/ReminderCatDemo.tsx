'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import '@/app/remindercat-demo.css';

const STORAGE_KEY = 'xiaoyue-remindercat-browser-reminder-v1';

type ActiveReminder = {
  id: string;
  task: string;
  dueAt: number;
  source: string;
};

type FiredReminder = ActiveReminder & {
  recovered?: boolean;
};

export type ParsedReminder = {
  durationMs: number;
  task: string;
  source: string;
};

const CHINESE_DIGITS: Record<string, number> = {
  '零': 0,
  '〇': 0,
  '一': 1,
  '二': 2,
  '两': 2,
  '三': 3,
  '四': 4,
  '五': 5,
  '六': 6,
  '七': 7,
  '八': 8,
  '九': 9
};

function parseChineseInteger(value: string): number | null {
  if (/^\d+$/.test(value)) return Number(value);

  let total = 0;
  let digit: number | null = null;

  for (const character of value) {
    if (character in CHINESE_DIGITS) {
      digit = CHINESE_DIGITS[character];
      continue;
    }

    const unit = character === '十' ? 10 : character === '百' ? 100 : null;
    if (!unit) return null;
    total += (digit ?? 1) * unit;
    digit = null;
  }

  return total + (digit ?? 0);
}

/** Parse a small, honest subset of natural-language reminders used by this demo. */
export function parseReminderText(rawValue: string): ParsedReminder | null {
  const source = rawValue.trim();
  const match = /([0-9]+|[零〇一二两三四五六七八九十百]+)\s*(分钟?|秒钟?|分|秒)/.exec(source);
  if (!match || typeof match.index !== 'number') return null;

  const amount = parseChineseInteger(match[1]);
  if (!amount || !Number.isFinite(amount)) return null;

  const isMinute = match[2].startsWith('分');
  const durationMs = amount * (isMinute ? 60_000 : 1_000);
  if (durationMs > 7 * 24 * 60 * 60 * 1_000) return null;

  let before = source.slice(0, match.index).trim();
  let after = source.slice(match.index + match[0].length).trim();
  before = before.replace(/(?:之后|以后|后)[，,\s]*$/, '');
  after = after.replace(/^(?:之后|以后|后)[，,\s]*/, '');

  const task = `${before} ${after}`
    .trim()
    .replace(/^[，,\s]+|[，,\s]+$/g, '')
    .replace(/^(?:请|帮我|麻烦你)?\s*(?:提醒一下我|提醒我|提示我|提醒|提示)\s*/, '')
    .trim();

  return {
    durationMs,
    task: task || '这件事',
    source
  };
}

export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [minutes, seconds].map((part) => String(part).padStart(2, '0'));
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${parts.join(':')}` : parts.join(':');
}

function isStoredReminder(value: unknown): value is ActiveReminder {
  if (!value || typeof value !== 'object') return false;
  const reminder = value as Partial<ActiveReminder>;
  return typeof reminder.id === 'string'
    && typeof reminder.task === 'string'
    && typeof reminder.dueAt === 'number'
    && Number.isFinite(reminder.dueAt)
    && typeof reminder.source === 'string';
}

export default function ReminderCatDemo() {
  const [input, setInput] = useState('一分钟后提醒我喝水');
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [firedReminder, setFiredReminder] = useState<FiredReminder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [storageReady, setStorageReady] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const dismissButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if ('Notification' in window) setNotificationPermission(Notification.permission);

    try {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      if (storedValue) {
        const candidate: unknown = JSON.parse(storedValue);
        if (isStoredReminder(candidate)) {
          if (candidate.dueAt > Date.now()) {
            setActiveReminder(candidate);
            setInput(candidate.source);
          } else {
            setFiredReminder({ ...candidate, recovered: true });
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // The in-page reminder still works if storage is unavailable or corrupted.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      if (activeReminder) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeReminder));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage is an enhancement, not a requirement for the current page session.
    }
  }, [activeReminder, storageReady]);

  useEffect(() => {
    if (!activeReminder) return;

    const finishReminder = () => {
      setActiveReminder((current) => {
        if (!current || current.id !== activeReminder.id) return current;
        setFiredReminder(current);

        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('提醒喵', { body: current.task, tag: current.id });
          } catch {
            // The accessible in-page alert remains the guaranteed fallback.
          }
        }

        return null;
      });
    };

    const tick = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= activeReminder.dueAt) finishReminder();
    };

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [activeReminder]);

  useEffect(() => {
    if (!firedReminder) return;
    dismissButtonRef.current?.focus();

    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiredReminder(null);
    };
    window.addEventListener('keydown', dismissOnEscape);
    return () => window.removeEventListener('keydown', dismissOnEscape);
  }, [firedReminder]);

  const submitReminder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseReminderText(input);
    if (!parsed) {
      setError('试试“5秒后提醒我伸个懒腰”或“一分钟后提醒我喝水”。');
      return;
    }

    const startTime = Date.now();
    setNow(startTime);
    setError(null);
    setFiredReminder(null);
    setActiveReminder({
      id: `remindercat-${startTime}`,
      task: parsed.task,
      dueAt: startTime + parsed.durationMs,
      source: parsed.source
    });
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch {
      setNotificationPermission(Notification.permission);
    }
  };

  const cancelReminder = () => {
    setActiveReminder(null);
    setError(null);
  };

  const remindAgain = () => {
    if (!firedReminder) return;
    const startTime = Date.now();
    setNow(startTime);
    setActiveReminder({
      id: `remindercat-${startTime}`,
      task: firedReminder.task,
      dueAt: startTime + 60_000,
      source: `一分钟后提醒我${firedReminder.task}`
    });
    setFiredReminder(null);
  };

  const remaining = activeReminder ? activeReminder.dueAt - now : 0;
  const notificationLabel = notificationPermission === 'granted'
    ? '系统通知已开启'
    : notificationPermission === 'denied'
      ? '系统通知已被关闭'
      : notificationPermission === 'unsupported'
        ? '当前浏览器不支持系统通知'
        : '可选：开启系统通知';

  return (
    <section className="remindercat-demo" aria-labelledby="remindercat-demo-title">
      <header className="remindercat-demo__header">
        <div>
          <p className="remindercat-demo__eyebrow">W.01 / REMINDERCAT</p>
          <h2 id="remindercat-demo-title">提醒喵</h2>
        </div>
        <span className="remindercat-demo__runtime">浏览器沙箱</span>
      </header>

      <div className="remindercat-demo__paper">
        <form className="remindercat-demo__form" onSubmit={submitReminder}>
          <label htmlFor="remindercat-command">告诉提醒喵</label>
          <div className="remindercat-demo__command">
            <input
              id="remindercat-command"
              name="reminder"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError(null);
              }}
              autoComplete="off"
              aria-describedby="remindercat-help remindercat-error"
            />
            <button type="submit">{activeReminder ? '重新设置' : '设置提醒'}</button>
          </div>
          <p id="remindercat-help" className="remindercat-demo__help">
            支持中文或数字的秒、分钟，例如“5秒后提醒我伸个懒腰”。
          </p>
          <p id="remindercat-error" className="remindercat-demo__error" role={error ? 'alert' : undefined}>
            {error}
          </p>
        </form>

        <div className="remindercat-demo__status" aria-live="polite">
          <div className="remindercat-demo__cat" aria-hidden="true">= ^ · ω · ^ =</div>
          {activeReminder ? (
            <div className="remindercat-demo__active">
              <p>提醒事项</p>
              <strong>{activeReminder.task}</strong>
              <time dateTime={new Date(activeReminder.dueAt).toISOString()}>
                {formatCountdown(remaining)}
              </time>
              <small>到时会在当前页面弹出提醒。刷新页面也会保留未过期计时。</small>
              <button type="button" className="remindercat-demo__quiet-action" onClick={cancelReminder}>取消这次提醒</button>
            </div>
          ) : (
            <div className="remindercat-demo__idle">
              <p>等你留下一句话。</p>
              <small>设置后，这里会显示提取的事项和实时倒计时。</small>
            </div>
          )}
        </div>

        <footer className="remindercat-demo__footer">
          <p><strong>边界说明：</strong>这是浏览器内演示，不会向企业微信发送消息。</p>
          <button
            type="button"
            onClick={requestNotificationPermission}
            disabled={notificationPermission !== 'default'}
          >
            {notificationLabel}
          </button>
        </footer>
      </div>

      {firedReminder && (
        <div className="remindercat-alert" role="presentation">
          <section
            className="remindercat-alert__paper"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remindercat-alert-title"
            aria-describedby="remindercat-alert-task"
          >
            <p className="remindercat-alert__eyebrow">提醒喵 / TIME’S UP</p>
            <h3 id="remindercat-alert-title">时间到了</h3>
            <p id="remindercat-alert-task" role="alert">{firedReminder.task}</p>
            {firedReminder.recovered && <small>这条提醒在页面关闭期间到时。</small>}
            <div className="remindercat-alert__actions">
              <button type="button" onClick={remindAgain}>再提醒一分钟</button>
              <button ref={dismissButtonRef} type="button" onClick={() => setFiredReminder(null)}>知道了</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
