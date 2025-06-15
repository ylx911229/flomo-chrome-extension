declare namespace chrome {
  namespace storage {
    namespace sync {
      function get(keys: string[], callback: (result: any) => void): void;
      function set(items: any, callback?: () => void): void;
    }
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }

    function query(queryInfo: any, callback: (tabs: Tab[]) => void): void;
    function sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
  }

  namespace runtime {
    function openOptionsPage(): void;
    const onMessage: {
      addListener(callback: (request: any, sender: any, sendResponse: (response: any) => void) => void): void;
    };
  }

  namespace contextMenus {
    function create(createProperties: any): void;
    const onClicked: {
      addListener(callback: (info: any, tab: any) => void): void;
    };
  }

  namespace notifications {
    function create(options: any): void;
  }
} 