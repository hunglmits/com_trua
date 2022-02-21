import { useCallback, useEffect, useState } from "react";

import messaging from "@react-native-firebase/messaging";
import { Alert } from "react-native";

const useNotificationHandler = () => {
  const [notiData, setNotiData] = useState();
  const [foregroundNotiData, setForegroundNotiData] = useState();

  useEffect(() => {
    if (!foregroundNotiData) return;

    const data = foregroundNotiData?.data;
    const noti = foregroundNotiData?.notification;

    Alert.alert(noti?.title, noti?.body, [
      {
        text: "OK",
        onPress: () => {
          setNotiData(data);
          setForegroundNotiData(null);
        },
      },
      { text: "Cancel", onPress: () => setForegroundNotiData(null) },
    ]);
  }, [foregroundNotiData]);

  function resetNotiData() {
    setNotiData(null);
  }

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
        setForegroundNotiData(item);
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
    resetNotiData,
  };
};

export default useNotificationHandler;
