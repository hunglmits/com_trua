// import analytics from '@react-native-firebase/analytics'
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";

import { WebView } from "react-native-webview";
import { useNotificationHandler, useShortcutBadge } from "../../hooks";

import messaging from "@react-native-firebase/messaging";

const ORIGIN_URL = "stg4.zwei-test.com";
const APP_PARAM = "?flag_app=true";
const BASE_URL = `https://zwei-test:MsVfM7aVBf@${ORIGIN_URL}/members/sign_in${APP_PARAM}`;

const ZweiWebview = () => {
  const { notificationHandler, notiData } = useNotificationHandler();
  const { setBadge } = useShortcutBadge();
  notificationHandler();

  const [deviceToken, setDeviceToken] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [url, setUrl] = useState(BASE_URL);
  const webviewRef = useRef();

  useEffect(() => {
    setBadge(0);
    initNotification();
  }, []);

  useEffect(() => {
    if (notiData?.url) {
      setUrl(`${notiData?.url}${APP_PARAM}`);
      return;
    }
    setUrl(BASE_URL);
  }, [notiData]);

  const initNotification = useCallback(() => {
    const asyncFunc = async () => {
      await messaging().requestPermission();
      const type = Platform.OS;
      const token = await messaging().getToken();
      setDeviceToken(token);
      setDeviceType(type);
    };
    asyncFunc();
  });

  const renderLoadingIndicatorView = () => {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color="#009b88" size="large" />
      </View>
    );
  };

  const renderWebview = () => {
    const js = `
      window.document.getElementById('member_device_token').value = '${deviceToken}';
      window.document.getElementById('member_device_name').value = '${deviceType}';
    `;

    return (
      <WebView
        ref={webviewRef}
        source={{
          uri: url,
        }}
        style={styles.webview}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        javaScriptEnabledAndroid={true}
        onShouldStartLoadWithRequest={(event) => {
          if (!event.url.includes(ORIGIN_URL)) {
            Linking.openURL(event.url);
            return false;
          }
          if (!event.url.includes(APP_PARAM)) {
            setUrl(`${event.url}${APP_PARAM}`);
            return false;
          }
          return true;
        }}
        injectedJavaScript={js}
        startInLoadingState={true}
        renderLoading={renderLoadingIndicatorView}
        allowsBackForwardNavigationGestures={true}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>{renderWebview()}</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
  loadingWrapper: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(ZweiWebview);
