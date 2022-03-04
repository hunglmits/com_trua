/** @format */

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

const ORIGIN_URL = "dev.zwei-test.com";
const APP_PARAM = "flag_app=true";
const BASE_URL = `https://zwei-test:MsVfM7aVBf@${ORIGIN_URL}`;
// const PARAM_URL = `${BASE_URL}/members/sign_in${APP_PARAM}`;
const PARAM_URL = `${BASE_URL}?${APP_PARAM}`;

const ZweiWebview = () => {
  const [onAppStateChange] = useAppState();
  const { notificationHandler, notiData, resetNotiData } =
    useNotificationHandler();
  notificationHandler();

  const { setBadge } = useShortcutBadge();

  const [deviceToken, setDeviceToken] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [url, setUrl] = useState(PARAM_URL);
  const [webKey, setWebKey] = useState(0);

  const webviewRef = useRef();

  useEffect(() => {
    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          const _notiUrl = remoteMessage?.data.url;
          const _url = _notiUrl.includes("?")
            ? `${_notiUrl}&${APP_PARAM}`
            : `${_notiUrl}?${APP_PARAM}`;
          const sliceUrl = _url.slice(8);
          const openUrl = "https://zwei-test:MsVfM7aVBf@" + sliceUrl;
          setUrl(openUrl);
          // setInitialRoute(remoteMessage.data.type) // e.g. "Settings"
        }
        // setLoading(false)
      });
  }, []);

  useEffect(() => {
    initNotification();
    onAppStateChange({
      onForeground: initNotification,
    });
  }, []);

  useEffect(() => {
    if (!notiData) return;
    const _notiUrl = notiData?.url;
    if (_notiUrl) {
      const _url = _notiUrl.includes("?")
        ? `${_notiUrl}&${APP_PARAM}`
        : `${_notiUrl}?${APP_PARAM}`;

      console.log(url, "open aPP kjkkkkkkkkkkkß");

      setUrl(_url.replace("http://", "https://"));
      setWebKey(webKey + 1); //reset webview
      resetNotiData();
      return;
    }
    // setUrl(PARAM_URL);
  }, [notiData]);

  const onResetNotificationCount = useCallback(
    (token = deviceToken) => {
      setBadge(0);
      console.log(deviceToken);
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
      window.document.getElementsByClassName('grecaptcha-badge')[0].style.display = 'none';
    `;

    return (
      <WebView
        key={webKey}
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
          console.log("url-->", url);
          if (
            !url ||
            url.includes(ORIGIN_URL) ||
            url.includes("recaptcha.net")
          ) {
            url.includes("sign_in") && webviewRef.current.injectJavaScript(js);

            return true;
          }
          Linking.openURL(url);
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
