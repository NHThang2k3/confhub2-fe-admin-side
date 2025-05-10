// src/hooks/chatbot/layout/useLeftPanelNavigation.ts
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, AppPathname, Link } from '@/src/navigation';
import type { ComponentProps } from 'react';
import {
  HomeIcon,
  History as HistoryIcon,
  Bot,
  Radio,
} from 'lucide-react';
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores'; // Path tới stores
import { useShallow } from 'zustand/react/shallow';

type AppHref = ComponentProps<typeof Link>['href'];

export interface NavItemBase {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  disabled?: boolean;
}
export interface NavLinkItem extends NavItemBase {
  type: 'link';
  href: AppHref;
  action?: () => void;
}
export interface NavButtonItem extends NavItemBase { // Giữ lại nếu bạn có button items
  type: 'button';
  action: () => void;
}
export type NavItem = NavLinkItem | NavButtonItem;

interface UseLeftPanelNavigationProps {
  currentView: 'chat' | 'history';
  isLiveServiceConnected?: boolean;
}

export function useLeftPanelNavigation({
  currentView,
  isLiveServiceConnected,
}: UseLeftPanelNavigationProps) {
  const t = useTranslations();
  const currentPathname = usePathname();
  const router = useRouter();

  const { chatMode, setChatMode } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
      setChatMode: state.setChatMode,
    }))
  );

  const disableChatModeSelection = !!isLiveServiceConnected;

  const handleNavItemClick = (itemMode: 'live' | 'regular', targetPath: AppPathname) => {
    if (disableChatModeSelection && chatMode !== itemMode) {
      console.warn('Cannot switch chat mode while live service is connected.');
      return;
    }
    if (chatMode !== itemMode) {
      setChatMode(itemMode);
    }
    router.push(targetPath);
  };

  const navItems: NavItem[] = useMemo(() => [
    {
      id: 'home',
      label: t('Home'),
      icon: HomeIcon,
      href: '/',
      isActive: currentPathname === '/',
      type: 'link',
    },
    {
      id: 'regularChat',
      label: t('Regular_Chat'),
      icon: Bot,
      href: '/chatbot/regularchat',
      isActive:
        currentView === 'chat' &&
        chatMode === 'regular' &&
        currentPathname === '/chatbot/regularchat',
      disabled: disableChatModeSelection,
      type: 'link',
      action: () => handleNavItemClick('regular', '/chatbot/regularchat'),
    },
    {
      id: 'liveStream',
      label: t('Live_Stream'),
      icon: Radio,
      href: '/chatbot/livechat',
      isActive:
        currentView === 'chat' &&
        chatMode === 'live' &&
        currentPathname === '/chatbot/livechat',
      disabled: disableChatModeSelection,
      type: 'link',
      action: () => handleNavItemClick('live', '/chatbot/livechat'),
    },
    {
      id: 'chatHistory',
      label: t('Chat_History'),
      icon: HistoryIcon,
      href: '/chatbot/history',
      isActive: currentView === 'history',
      type: 'link',
      action: () => {
        // Nếu vào trang history, có thể muốn đảm bảo chatMode là 'regular'
        // hoặc để nó giữ nguyên mode hiện tại.
        // Ví dụ: nếu muốn set về regular khi vào history:
        // if (chatMode !== 'regular') {
        //   setChatMode('regular');
        // }
        router.push('/chatbot/history');
      }
    },
  ], [t, currentPathname, currentView, chatMode, disableChatModeSelection, handleNavItemClick, router, setChatMode]);
  // Thêm router, setChatMode vào dependencies của useMemo nếu handleNavItemClick không được memoized đúng cách
  // Hoặc wrap handleNavItemClick bằng useCallback

  return { navItems }; // handleNavItemClick không cần trả về vì nó được dùng trong action của navItems
}