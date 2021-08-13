import { useCallback, useState } from "react";

import messaging from "@react-native-firebase/messaging";

const useNotificationHandler = () => {
  const [notiData, setNotiData] = useState();

  function onReceivedNotification() {
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
      async (item) => {
        const data = item?.data;
        if (!data) return;
        setNotiData(data);
      }
    );

    return {
      unsubscribeNotificationOpened,
    };
  }

  const notificationHandler = useCallback(() => {
    const unsubscribe = onReceivedNotification();

    return () => {
      unsubscribe.unsubscribeNotificationOpened();
    };
  });

  return {
    notificationHandler,
    notiData,
  };
};

export default useNotificationHandler;
