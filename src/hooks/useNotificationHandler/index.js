import { useCallback, useState } from "react";

import messaging from "@react-native-firebase/messaging";
import { Alert } from "react-native";

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

  function onForegroundNotification() {
    const unsubscribeForegroundNotification = messaging().onMessage(
      async (item) => {
        const data = item?.data;
        const noti = item?.notification;

        Alert.alert(noti?.title, noti?.body, [
          { text: "OK", onPress: () => setNotiData(data) },
          { text: "Cancel", onPress: () => {} },
        ]);
      }
    );

    return {
      unsubscribeForegroundNotification,
    };
  }

  const notificationHandler = useCallback(() => {
    const unsubscribe = onReceivedNotification();
    const foregroundNotification = onForegroundNotification();

    return () => {
      unsubscribe.unsubscribeNotificationOpened();
      foregroundNotification.unsubscribeForegroundNotification();
    };
  });

  return {
    notificationHandler,
    notiData,
  };
};

export default useNotificationHandler;
