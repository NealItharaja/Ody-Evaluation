import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { SemanticTone } from '../theme/theme';
import { IconButton } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ToastTone = Extract<
  SemanticTone,
  'success' | 'warning' | 'danger' | 'info' | 'neutral'
>;

export type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

export type ToastInput = Omit<Toast, 'id' | 'tone'> & { tone?: ToastTone; durationMs?: number };

type ToastApi = {
  show: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    ({ tone = 'neutral', durationMs = DEFAULT_DURATION, ...rest }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, tone, ...rest }].slice(-4));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), durationMs),
      );
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      success: (title, description) => show({ tone: 'success', title, description }),
      error: (title, description) => show({ tone: 'danger', title, description, durationMs: 6000 }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a <ToastProvider>');
  return context;
}

const toneIcon: Record<ToastTone, IconName> = {
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-octagon',
  info: 'info',
  neutral: 'bell',
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  const t = useTheme();
  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: t.space[6],
        bottom: t.space[6],
        gap: t.space[3],
        zIndex: t.zIndex.toast,
        maxWidth: 380,
      }}
    >
      {toasts.map((toast) => {
        const ramp = t.tone[toast.tone];
        return (
          <View
            key={toast.id}
            accessibilityLiveRegion="polite"
            style={[
              {
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: t.space[3],
                minWidth: 300,
                padding: t.space[4],
                borderRadius: t.radius.lg,
                backgroundColor: t.color.surface,
                borderWidth: t.borderWidth.thin,
                borderColor: t.color.border,
                borderLeftWidth: 3,
                borderLeftColor: ramp.solid,
              },
              t.elevation[3] as ViewStyle,
            ]}
          >
            <Icon name={toneIcon[toast.tone]} size="md" color={ramp.solid} />
            <View style={{ flex: 1, gap: t.space[0.5] }}>
              <Text variant="label">{toast.title}</Text>
              {toast.description ? (
                <Text variant="caption" tone="muted">
                  {toast.description}
                </Text>
              ) : null}
            </View>
            <IconButton
              icon="x"
              size="sm"
              accessibilityLabel="Dismiss notification"
              onPress={() => onDismiss(toast.id)}
            />
          </View>
        );
      })}
    </View>
  );
}
