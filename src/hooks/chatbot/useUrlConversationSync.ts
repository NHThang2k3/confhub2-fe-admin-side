import { useEffect, useRef } from 'react';
import { useRouter, usePathname, AppPathname } from '@/src/navigation';
import { useConversationStore, useSocketStore } from '@/src/app/[locale]/chatbot/stores';
import { useShallow } from 'zustand/react/shallow';
import { useSearchParams } from 'next/navigation';
import { CHATBOT_LIVECHAT_PATH } from '@/src/app/[locale]/chatbot/MainLayout';

interface UseUrlConversationSyncProps {
  currentView: 'chat' | 'history';
  isProcessingDeletion: boolean;
  idBeingDeleted: string | null;
}

export function urlSearchParamsToObject(params: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  if (params) {
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
  }
  return obj;
}

export function useUrlConversationSync({
  currentView,
  isProcessingDeletion,
  idBeingDeleted,
}: UseUrlConversationSyncProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const searchParamsHook = useSearchParams();

  const {
    activeConversationId,
    isLoadingHistory,
    loadConversation,
  } = useConversationStore(
    useShallow(state => ({
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      loadConversation: state.loadConversation,
    }))
  );

  const { isConnected, isServerReadyForCommands } = useSocketStore(
    useShallow(state => ({
      isConnected: state.isConnected,
      isServerReadyForCommands: state.isServerReadyForCommands,
    }))
  );

  const internalUrlUpdateRef = useRef(false);
  const didAttemptLoadFromUrlRef = useRef(false);
  const prevUrlIdParamForEffect2ResetRef = useRef<string | null>(null);
  const prevActiveConversationIdForEffect1Ref = useRef<string | null | undefined>(undefined);

  const urlIdParam = searchParamsHook.get('id');
  const searchParamsString = searchParamsHook.toString();

 
  // Effect 1: Đồng bộ activeConversationId (từ store) ra URL (?id=...)
  useEffect(() => {
    if (isProcessingDeletion && idBeingDeleted === urlIdParam) {
      // console.log(`[useUrlConversationSync Effect1] Deletion in progress for ${urlIdParam}, skipping URL sync.`);
      return;
    }

    const newParams = new URLSearchParams(searchParamsString);
    let shouldUpdateURL = false;
    const isLiveChatCurrentPath = currentPathname === CHATBOT_LIVECHAT_PATH;
    // const isRegularChatCurrentPath = currentPathname === CHATBOT_REGULARCHAT_PATH; // Not strictly needed for revised logic

    if (isLiveChatCurrentPath) {
      if (newParams.has('id')) {
        // console.log(`[useUrlConversationSync Effect1] On live chat path (${currentPathname}) with URL ID ${newParams.get('id')}. Removing ID.`);
        newParams.delete('id');
        shouldUpdateURL = true;
      }
    } else if (currentView === 'chat') {
      if (activeConversationId) { // Store has an active conversation
        if (urlIdParam !== activeConversationId) {
          // console.log(`[useUrlConversationSync Effect1] Chat View (${currentPathname}): ActiveId (${activeConversationId}) differs from URL ID (${urlIdParam || 'null'}). Setting URL ID to ${activeConversationId}.`);
          newParams.set('id', activeConversationId);
          shouldUpdateURL = true;
        }
      } else { // activeConversationId is null in store
        if (urlIdParam) { // But URL has an ID
          // Only clear URL ID if activeId *became* null (e.g. new chat, deletion finished, explicit set to null)
          // NOT on initial load where activeId is null and urlIdParam exists, because Effect 2 should handle loading it.
          if (prevActiveConversationIdForEffect1Ref.current !== null &&
              prevActiveConversationIdForEffect1Ref.current !== undefined) {
            // console.log(`[useUrlConversationSync Effect1] Chat View (${currentPathname}): ActiveId became null (was ${prevActiveConversationIdForEffect1Ref.current}). URL ID (${urlIdParam}) exists. Removing ID from URL.`);
            newParams.delete('id');
            shouldUpdateURL = true;
          }
          // else: activeId is null, prevActiveId was also null/undefined, but urlIdParam exists.
          // This is the state during initial load of a specific chat URL.
          // Effect 2 is responsible for loading from urlIdParam. Don't clear the URL ID here.
        }
        // If activeConversationId is null AND urlIdParam is also null, nothing to do.
      }
    } else { // currentView is 'history'
      if (urlIdParam) {
        // console.log(`[useUrlConversationSync Effect1] In history view with URL ID ${urlIdParam}. Removing ID from URL.`);
        newParams.delete('id');
        shouldUpdateURL = true;
      }
    }

    if (shouldUpdateURL) {
      const newQueryString = newParams.toString();
      if (newQueryString !== searchParamsString) {
        // console.log(`[useUrlConversationSync Effect1] Syncing URL. Path: ${currentPathname}, New query: ?${newQueryString}. Setting internalUrlUpdateRef.`);
        internalUrlUpdateRef.current = true;
        router.replace(
          { pathname: currentPathname as AppPathname, query: urlSearchParamsToObject(newParams) },
          { scroll: false }
        );
      }
    }
    prevActiveConversationIdForEffect1Ref.current = activeConversationId;
  }, [
    activeConversationId, currentView, currentPathname, router,
    urlIdParam, searchParamsString, isProcessingDeletion, idBeingDeleted,
    // prevActiveConversationIdForEffect1Ref.current is implicitly part of this via activeConversationId
  ]);


  // Effect 2: Load conversation from URL if conditions are met
  useEffect(() => {
    if (internalUrlUpdateRef.current) {
      // console.log("[useUrlConversationSync Effect2] URL update was internal (from Effect1). Resetting flag and skipping load.");
      internalUrlUpdateRef.current = false;
      return;
    }

    // Reset didAttemptLoadFromUrlRef if urlIdParam changes, or if we switch away from chat view
    // This allows re-attempts if the user navigates back to the same problematic URL ID after it failed once.
    if ((urlIdParam !== prevUrlIdParamForEffect2ResetRef.current || (urlIdParam && currentView !== 'chat')) && didAttemptLoadFromUrlRef.current) {
      // console.log(`[useUrlConversationSync Effect2] urlIdParam or currentView changed. Resetting didAttemptLoadFromUrlRef. Old urlId: ${prevUrlIdParamForEffect2ResetRef.current}, New urlId: ${urlIdParam}, currentView: ${currentView}`);
      didAttemptLoadFromUrlRef.current = false;
    }
    prevUrlIdParamForEffect2ResetRef.current = urlIdParam;

    if (isProcessingDeletion && idBeingDeleted === urlIdParam) {
      // console.log(`[useUrlConversationSync Effect2] Deletion in progress for ${urlIdParam}, skipping load from URL.`);
      return;
    }

    const isLiveChatCurrentPath = currentPathname === CHATBOT_LIVECHAT_PATH;
    // const isRegularChatCurrentPath = currentPathname === CHATBOT_REGULARCHAT_PATH; // Not needed for the removed block

    if (isLiveChatCurrentPath) {
      // If on live chat, any 'id' param is invalid. Reset attempt flag if it was set.
      if (urlIdParam && didAttemptLoadFromUrlRef.current) {
        // console.log(`[useUrlConversationSync Effect2] On live chat path with URL ID ${urlIdParam} and didAttemptLoad. Resetting didAttemptLoadFromUrlRef.`);
        didAttemptLoadFromUrlRef.current = false;
      }
      return; // No conversation loading from ID on live chat path
    }

    // ---- THIS BLOCK WAS THE PRIMARY ISSUE AND IS REMOVED ----
    // if (isRegularChatCurrentPath && activeConversationId === null) {
    //   console.log(`[useUrlConversationSync Effect2] On regular chat path and activeConversationId is null. Assuming blank slate. Skipping load from URL ID: ${urlIdParam}.`);
    //   if (urlIdParam && didAttemptLoadFromUrlRef.current) {
    //     didAttemptLoadFromUrlRef.current = false;
    //   }
    //   return;
    // }
    // ---- END REMOVED BLOCK ----

    if (
      currentView === 'chat' &&
      urlIdParam &&                              // There's an ID in the URL to load
      activeConversationId !== urlIdParam &&     // And it's not already the active one
      !isLoadingHistory &&                       // And we're not already loading history (could be for this one or another)
      isConnected && isServerReadyForCommands && // And socket is ready
      !didAttemptLoadFromUrlRef.current          // And we haven't already tried loading this specific urlIdParam in this "session" of it being in the URL
    ) {
      // console.log(`[useUrlConversationSync Effect2] Attempting to load conversation ${urlIdParam} from URL. Current activeId: ${activeConversationId || 'null'}.`);
      didAttemptLoadFromUrlRef.current = true; // Mark that we are now attempting to load this urlIdParam
      loadConversation(urlIdParam, { isFromUrl: true });
    } else if (currentView === 'chat' && urlIdParam && activeConversationId === urlIdParam && didAttemptLoadFromUrlRef.current) {
      // console.log(`[useUrlConversationSync Effect2] urlIdParam ${urlIdParam} matches activeId. didAttemptLoadFromUrlRef is true. No action needed, load was attempted/completed.`);
    } else if (currentView === 'chat' && urlIdParam && activeConversationId !== urlIdParam && !didAttemptLoadFromUrlRef.current) {
      // Conditions to load are met, but some prerequisite like socket or isLoadingHistory is blocking. Log if needed.
      // if (isLoadingHistory) {
        // console.log(`[useUrlConversationSync Effect2] Conditions met to load ${urlIdParam} from URL, but isLoadingHistory is true. Waiting.`);
      // } else if (!isConnected || !isServerReadyForCommands) {
        // console.log(`[useUrlConversationSync Effect2] Conditions met to load ${urlIdParam} from URL, but socket not ready. Waiting. Connected: ${isConnected}, ServerReady: ${isServerReadyForCommands}`);
      // }
    }
  }, [
    urlIdParam, currentView, currentPathname, activeConversationId, loadConversation,
    isLoadingHistory, isConnected, isServerReadyForCommands, isProcessingDeletion, idBeingDeleted,
    // didAttemptLoadFromUrlRef.current is not a dependency here, it's managed internally
    // searchParamsString is implicitly covered by urlIdParam change
  ]);

  return { didAttemptLoadFromUrlRef };
}