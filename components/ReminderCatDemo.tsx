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
      <div className="remindercat-demo__window">
        <header className="remindercat-demo__appbar">
          <div className="remindercat-demo__identity">
            <span className="remindercat-demo__avatar" aria-hidden="true">喵</span>
            <div>
              <h2 id="remindercat-demo-title">提醒喵</h2>
              <p><span aria-hidden="true" />浏览器中在线</p>
            </div>
          </div>
          <span className="remindercat-demo__runtime">本机试用</span>
        </header>

        <div className="remindercat-demo__workspace">
          <div className="remindercat-demo__chat">
            <div className="remindercat-demo__messages">
              <span className="remindercat-demo__day">今天</span>
              <div className="remindercat-demo__message remindercat-demo__message--cat">
                <span className="remindercat-demo__mini-avatar" aria-hidden="true">喵</span>
                <p>在吗？想让我什么时候叫你？</p>
              </div>

              {activeReminder ? (
                <>
                  <div className="remindercat-demo__message remindercat-demo__message--you">
                    <p>{activeReminder.source}</p>
                  </div>
                  <div className="remindercat-demo__message remindercat-demo__message--cat remindercat-demo__message--reminder">
                    <span className="remindercat-demo__mini-avatar" aria-hidden="true">喵</span>
                    <div className="remindercat-demo__active">
                      <div className="remindercat-demo__active-heading">
                        <span>提醒已设置</span>
                        <time dateTime={new Date(activeReminder.dueAt).toISOString()}>
                          {new Date(activeReminder.dueAt).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>
                      <strong>{activeReminder.task}</strong>
                      <div className="remindercat-demo__countdown">
                        <span>剩余</span>
                        <time dateTime={`PT${Math.max(0, Math.ceil(remaining / 1_000))}S`}>
                          {formatCountdown(remaining)}
                        </time>
                      </div>
                      <button type="button" className="remindercat-demo__quiet-action" onClick={cancelReminder}>
                        取消提醒
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="remindercat-demo__empty" aria-hidden="true">
                  <span>= ^ · ω · ^ =</span>
                </div>
              )}

              {error && (
                <div className="remindercat-demo__message remindercat-demo__message--cat remindercat-demo__message--error" role="alert">
                  <span className="remindercat-demo__mini-avatar" aria-hidden="true">喵</span>
                  <p>{error}</p>
                </div>
              )}
            </div>

            <form className="remindercat-demo__composer" onSubmit={submitReminder}>
              <label className="remindercat-demo__sr-only" htmlFor="remindercat-command">输入提醒</label>
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
                  placeholder="例如：一分钟后提醒我喝水"
                  aria-describedby="remindercat-help"
                />
                <button type="submit" aria-label={activeReminder ? '重新设置提醒' : '发送并设置提醒'}>
                  <span>{activeReminder ? '更新' : '发送'}</span>
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m3.4 3.6 13.4 5.7c.6.25.6 1.1 0 1.36L3.4 16.4c-.53.23-1.08-.25-.9-.8l1.52-4.5 6.72-1.1-6.72-1.1L2.5 4.4c-.18-.55.37-1.03.9-.8Z" />
                  </svg>
                </button>
              </div>
              <p id="remindercat-help">可识别中文或数字的秒、分钟</p>
            </form>
          </div>

          <aside className="remindercat-demo__settings" aria-label="提醒设置与状态">
            <div className="remindercat-demo__settings-heading">
              <div>
                <span className="remindercat-demo__settings-kicker">提醒状态</span>
                <strong aria-live="polite" aria-atomic="true">{activeReminder ? '正在计时' : '暂无提醒'}</strong>
              </div>
              <span className={activeReminder ? 'is-active' : undefined} aria-hidden="true" />
            </div>

            <dl className="remindercat-demo__facts">
              <div>
                <dt>页面提醒</dt>
                <dd>已开启</dd>
              </div>
              <div>
                <dt>刷新后保留</dt>
                <dd>本机存储</dd>
              </div>
              <div>
                <dt>系统通知</dt>
                <dd>{notificationPermission === 'granted' ? '已开启' : '未开启'}</dd>
              </div>
            </dl>

            <button
              className="remindercat-demo__notification-action"
              type="button"
              onClick={requestNotificationPermission}
              disabled={notificationPermission !== 'default'}
            >
              <span aria-hidden="true">◌</span>
              {notificationLabel}
            </button>

            <p className="remindercat-demo__boundary">
              计时在此浏览器运行；页面提醒始终可用，系统通知取决于浏览器权限。不连接企业微信。
            </p>
          </aside>
        </div>
      </div>

      {firedReminder && (
        <div className="remindercat-alert" role="presentation">
          <section
            className="remindercat-alert__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remindercat-alert-title"
            aria-describedby="remindercat-alert-task"
          >
            <span className="remindercat-alert__icon" aria-hidden="true">喵</span>
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
