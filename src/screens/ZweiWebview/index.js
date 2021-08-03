// import analytics from '@react-native-firebase/analytics'
import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, Platform } from "react-native";

import { WebView } from "react-native-webview";
import { Constants } from "../../utils";

import messaging from "@react-native-firebase/messaging";

const ZweiWebview = () => {
  const [deviceToken, setDeviceToken] = useState("");
  const [deviceType, setDeviceType] = useState("");

  useEffect(() => {
    initNotification();
  }, []);

  const initNotification = useCallback(() => {
    const asyncFunc = async () => {
      await messaging().requestPermission();
      const type = Platform.OS;
      const token = await messaging().getToken();
      console.log("token-", token);
      setDeviceToken(token);
      setDeviceType(type);
    };
    asyncFunc();
  });

  return (
    <WebView
      source={{
        uri: `https://zwei-test:MsVfM7aVBf@dev.zwei-test.com/members/sign_in?device_token=${deviceToken}&device_name=${deviceType}`,
      }}
      style={styles.webview}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    marginTop: Constants.layout.navPadding,
    marginBottom: Constants.layout.navPadding / 2,
  },
});

export default React.memo(ZweiWebview);
