// import analytics from '@react-native-firebase/analytics'
import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";

import { WebView } from "react-native-webview";
import { Constants } from "../../utils";

import messaging from "@react-native-firebase/messaging";

const ZweiWebview = () => {
  const [deviceToken, setDeviceToken] = useState("");
  const [deviceType, setDeviceType] = useState("");

  const webviewRef = useRef();

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

  const renderWebview = () => {
    const js = `
      window.document.getElementById('member_device_token').value = '${deviceToken}';
      window.document.getElementById('member_device_name').value = '${deviceType}';
    `;

    return (
      <WebView
        ref={webviewRef}
        source={{
          uri: `https://zwei-test:MsVfM7aVBf@dev.zwei-test.com/members/sign_in`,
        }}
        style={styles.webview}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        javaScriptEnabledAndroid={true}
        onMessage={(event) => {}}
        injectedJavaScript={js}
      />
    );
  };

  return <View style={styles.container}>{renderWebview()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    marginTop: Constants.layout.navPadding,
    marginBottom: Constants.layout.navPadding / 2,
  },
});

export default React.memo(ZweiWebview);
