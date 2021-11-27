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
import {
  useNotificationHandler,
  useShortcutBadge,
  useAppState,
} from "../../hooks";

import messaging from "@react-native-firebase/messaging";

const ORIGIN_URL = "stg4.zwei-test.com";
const APP_PARAM = "?flag_app=true";
const BASE_URL = `https://zwei-test:MsVfM7aVBf@${ORIGIN_URL}`;
const PARAM_URL = `${BASE_URL}/members/sign_in${APP_PARAM}`;
// const PARAM_URL = `${BASE_URL}${APP_PARAM}`;

const ZweiWebview = () => {
  const [onAppStateChange] = useAppState();
  const { notificationHandler, notiData } = useNotificationHandler();
  const { setBadge } = useShortcutBadge();
  notificationHandler();

  const [deviceToken, setDeviceToken] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [url, setUrl] = useState(PARAM_URL);
  const webviewRef = useRef();

  useEffect(() => {
    initNotification();
    onAppStateChange({
      onForeground: initNotification,
    });
  }, []);

  useEffect(() => {
    if (notiData?.url) {
      setUrl(`${notiData?.url}${APP_PARAM}`);
      return;
    }
    setUrl(PARAM_URL);
  }, [notiData]);

  const onResetNotificationCount = useCallback(
    (token = deviceToken) => {
      setBadge(0);
      fetch(
        `${BASE_URL}/api/v1/members/reset_notify?device_token=${
          token || deviceToken
        }`
      );
      // .then((res) => console.log("res", res));
    },
    [fetch, deviceToken, setBadge]
  );

  const initNotification = useCallback(() => {
    const asyncFunc = async () => {
      await messaging().requestPermission();
      const type = Platform.OS;
      const token = await messaging().getToken();
      setDeviceToken(token);
      setDeviceType(type);
      onResetNotificationCount(token);
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
        onMessage={(event) => {
          console.log("event-->", event);
        }}
        injectedJavaScript={js}
        startInLoadingState={true}
        onShouldStartLoadWithRequest={(event) => {
          const { url } = event;
          if (!url || url.includes(ORIGIN_URL)) return true;

          // webviewRef.current.stopLoading();
          Linking.openURL(event.url);
          return false;
        }}
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
