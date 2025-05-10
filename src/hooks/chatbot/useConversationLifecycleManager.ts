
// src/hooks/chatbot/layout/useConversationLifecycleManager.ts
import { useEffect } from 'react';
import { useRouter, usePathname, AppPathname } from '@/src/navigation';
import { useConversationStore } from '@/src/app/[locale]/chatbot/stores';
import { useShallow } from 'zustand/react/shallow';

const CHATBOT_HISTORY_PATH: AppPathname = '/chatbot/history'; // Ensure this is correct

interface UseConversationLifecycleManagerProps {
  currentView: 'chat' | 'history';
  isProcessingDeletion: boolean;    // From MainLayout's local state
  idBeingDeleted: string | null;      // From MainLayout's local state
  prevActiveIdRef: React.RefObject<string | null>; // From MainLayout
  didAttemptLoadFromUrlRef: React.RefObject<boolean>; // From useUrlConversationSync (via MainLayout)
  urlIdParam: string | null;          // From MainLayout (derived from searchParams)
  searchParamsString: string;       // From MainLayout (derived from searchParams)

  // Callbacks to update MainLayout's local state
  onDeletionProcessed: () => void;
  onNotFoundProcessed: () => void;
}

function urlSearchParamsToObject(params: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  if (params) {
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
  }
  return obj;
}


export function useConversationLifecycleManager({
  currentView,
  isProcessingDeletion,
  idBeingDeleted,
  prevActiveIdRef,
  didAttemptLoadFromUrlRef, // Nhận ref này từ MainLayout
  urlIdParam,
  searchParamsString,
  onDeletionProcessed,
  onNotFoundProcessed,
}: UseConversationLifecycleManagerProps) {
  const router = useRouter();
  const currentPathname = usePathname();

  const {
    activeConversationId,
    conversationList,
    isLoadingHistory,
    isHistoryLoaded, // Thêm cờ này từ store
  } = useConversationStore(
    useShallow(state => ({
      activeConversationId: state.activeConversationId,
      conversationList: state.conversationList,
      isLoadingHistory: state.isLoadingHistory,
      isHistoryLoaded: state.isHistoryLoaded, // Cần cờ này để biết load đã hoàn tất chưa
    }))
  );

  // Effect: Redirect AFTER store confirms deletion (via conversationList update)
  useEffect(() => {
    if (isProcessingDeletion && idBeingDeleted) {
      const conversationExistsInList = conversationList.some(c => c.id === idBeingDeleted);
      const activeWasDeletedAndNowNull = prevActiveIdRef.current === idBeingDeleted && activeConversationId === null;

      if (!conversationExistsInList || activeWasDeletedAndNowNull) {
        console.log(`[useConversationLifecycleManager] Deletion of ${idBeingDeleted} confirmed by store. Finalizing.`);

        if (urlIdParam === idBeingDeleted) {
          const cleanedParams = new URLSearchParams(searchParamsString);
          cleanedParams.delete('id');
          router.replace(
            { pathname: currentPathname, query: urlSearchParamsToObject(cleanedParams) },
            { scroll: false }
          );
        }

        if (currentView === 'chat' || prevActiveIdRef.current === idBeingDeleted) {
          router.push(CHATBOT_HISTORY_PATH);
        }
        onDeletionProcessed(); // Notify MainLayout to reset its local state
      }
    }
  }, [
    conversationList, activeConversationId, isProcessingDeletion, idBeingDeleted,
    router, currentPathname, urlIdParam, searchParamsString, currentView, prevActiveIdRef, onDeletionProcessed
  ]);


  useEffect(() => {
    // console.log(
    //   `[LCM RUN] urlId: ${urlIdParam}, didAttempt: ${didAttemptLoadFromUrlRef.current}, activeId: ${activeConversationId}, isLoading: ${isLoadingHistory}, isLoaded: ${isHistoryLoaded}, listHasIt: ${conversationList.some(c => c.id === urlIdParam)}`
    // );

    if (
      currentView === 'chat' &&
      urlIdParam &&                     // Phải có ID trên URL
      didAttemptLoadFromUrlRef.current && // Phải đang trong quá trình "đã thử load từ URL"
      !isProcessingDeletion
    ) {
      // Nếu `activeConversationId` từ store chưa khớp với `urlIdParam` mà chúng ta đang cố gắng load,
      // có nghĩa là action `setActiveConversationId` từ `loadConversation` có thể chưa lan truyền tới hook này.
      // Hoặc, một conversation khác đang active.
      // Trong trường hợp này, chúng ta nên đợi, vì `useUrlConversationSync` đang xử lý việc set activeId.
      if (activeConversationId !== urlIdParam) {
        console.log(`[useConversationLifecycleManager] Waiting. urlIdParam (${urlIdParam}) differs from activeConversationId (${activeConversationId}). didAttemptRef is true.`);
        // Có thể `useUrlConversationSync` đang trong quá trình gọi `loadConversation` (sẽ set activeId)
        // hoặc một conversation khác đang active và `useUrlConversationSync` sẽ xử lý sau.
        // Nếu `isLoadingHistory` là true, đó là dấu hiệu tốt là có gì đó đang load.
        // Nếu không, có thể là trạng thái chuyển tiếp. Tạm thời return để đợi state ổn định.
        return;
      }

      // Tại thời điểm này:
      // - currentView is 'chat'
      // - urlIdParam is not null
      // - didAttemptLoadFromUrlRef.current is true
      // - activeConversationId === urlIdParam (quan trọng!)

      // Bây giờ, vì activeConversationId đã khớp với urlIdParam, ta mới kiểm tra trạng thái loading của NÓ.
      if (isLoadingHistory) {
        console.log(`[useConversationLifecycleManager] Active conversation (${activeConversationId}) matches urlIdParam and is loading (isLoadingHistory true). Waiting.`);
        return; // Đợi cho nó load xong (isHistoryLoaded sẽ thành true, isLoadingHistory sẽ thành false)
      }

      // Tại thời điểm này:
      // - activeConversationId === urlIdParam
      // - isLoadingHistory is false (tức là việc load cho activeConversationId này đã hoàn tất hoặc thất bại)

      const conversationExistsInList = conversationList.some(c => c.id === urlIdParam);
      // isHistoryLoaded sẽ là true nếu _onSocketInitialHistory đã chạy thành công cho activeConversationId (chính là urlIdParam)
      // const isActiveAndActuallyLoaded = activeConversationId === urlIdParam && isHistoryLoaded;
      // Vì ở trên đã có activeConversationId === urlIdParam và !isLoadingHistory,
      // thì `isHistoryLoaded` là yếu tố quyết định cuối cùng cho "actually loaded".

      if (!isHistoryLoaded && !conversationExistsInList) {
        // Nếu nó không được load thành công (isHistoryLoaded = false) VÀ cũng không có trong danh sách
        // thì coi như "not found".
        console.log(`[useConversationLifecycleManager] urlIdParam ${urlIdParam} (which is active) is NOT loaded (isHistoryLoaded: ${isHistoryLoaded}) AND NOT in list. Redirecting. (didAttemptRef: ${didAttemptLoadFromUrlRef.current})`);
        const params = new URLSearchParams(searchParamsString);
        params.delete('id');
        router.replace(
          { pathname: currentPathname as AppPathname, query: urlSearchParamsToObject(params) },
          { scroll: false }
        );
        router.push(CHATBOT_HISTORY_PATH);
        onNotFoundProcessed();
      } else if (isHistoryLoaded) { // Nó đã được load thành công (dù có trong list hay không)
        console.log(`[useConversationLifecycleManager] Conversation ${urlIdParam} (active) is successfully loaded (isHistoryLoaded true). No redirect. (listHasIt: ${conversationExistsInList})`);
        // Nếu bạn muốn reset didAttemptLoadFromUrlRef khi thành công, onNotFoundProcessed có thể không phù hợp về tên.
        // Có thể cần một callback onUrlLoadProcessed() riêng.
        // Hoặc, chấp nhận didAttemptLoadFromUrlRef giữ nguyên true cho urlIdParam này cho đến khi urlIdParam thay đổi.
        // Nếu onNotFoundProcessed dùng để reset cờ trong mọi trường hợp đã xử lý (kể cả thành công):
        // onNotFoundProcessed(); // Nếu callback này reset didAttemptLoadFromUrlRef
      } else if (conversationExistsInList) {
        // Nó có trong list, nhưng isHistoryLoaded là false (và isLoadingHistory cũng false).
        // Đây là trường hợp lạ, có thể là conversation bị lỗi không load được message.
        // Hoặc có thể là một trạng thái chuyển tiếp rất ngắn.
        // Tạm thời coi như nó tồn tại và không redirect. `useUrlConversationSync` có thể thử load lại nếu cần.
        console.log(`[useConversationLifecycleManager] Conversation ${urlIdParam} (active) IS IN LIST but NOT loaded (isHistoryLoaded: ${isHistoryLoaded}, isLoadingHistory: ${isLoadingHistory}). No redirect for now.`);
      }
    }
  }, [
    currentView,
    urlIdParam,
    activeConversationId,
    conversationList,
    isLoadingHistory,
    isHistoryLoaded,
    didAttemptLoadFromUrlRef, // Chỉ là ref object, không trigger re-run khi .current thay đổi
    isProcessingDeletion,
    router,
    currentPathname,
    searchParamsString,
    onNotFoundProcessed,
  ]);



  // Cleanup if path changes significantly during deletion
  useEffect(() => {
    if (isProcessingDeletion && currentPathname === CHATBOT_HISTORY_PATH && idBeingDeleted) {
      console.log("[useConversationLifecycleManager Cleanup] Navigated to history while deletion was processing. Resetting deletion state via onDeletionProcessed.");
      onDeletionProcessed();
    }
  }, [isProcessingDeletion, currentPathname, idBeingDeleted, onDeletionProcessed]);
}