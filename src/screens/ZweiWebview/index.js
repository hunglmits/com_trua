/** @format */

// import analytics from '@react-native-firebase/analytics'
import React, {useCallback, useEffect, useRef, useState} from "react";
import {ActivityIndicator, Linking, Platform, SafeAreaView, StyleSheet, View,} from "react-native";

import {WebView} from "react-native-webview";
import {useAppState, useNotificationHandler, useShortcutBadge,} from "../../hooks";

import messaging from "@react-native-firebase/messaging";

// TODO: STG4
// const ORIGIN_URL = "stg4.zwei-test.com";
// TODO: DEV
// const ORIGIN_URL = "dev.zwei-test.com";
// TODO: STG5-3
const ORIGIN_URL = "stg5-3.zwei-test.com";
// TODO: Product
// const ORIGIN_URL = "app.zwei.ne.jp";
// TODO: Localhost
// const ORIGIN_URL = "192.168.1.127:3001";
// const ORIGIN_URL_SIGN_IN = `http://${ORIGIN_URL}/members/sign_in`;
// const ORIGIN_URL_NEWS = `http://${ORIGIN_URL}/news`;
// const ORIGIN_URL_PASSWORD_NEWS = `http://${ORIGIN_URL}/members/password/new`;
// const APP_PARAM = "flag_app=true";
// const BASE_URL = `http://${ORIGIN_URL}`;
// const PARAM_URL = `${BASE_URL}?${APP_PARAM}`;

const ORIGIN_URL_SIGN_IN = `https://${ORIGIN_URL}/members/sign_in`;
const ORIGIN_URL_NEWS = `https://${ORIGIN_URL}/news`;
const ORIGIN_URL_PASSWORD_NEWS = `https://${ORIGIN_URL}/members/password/new`;
const APP_PARAM = "flag_app=true";
const BASE_URL = `https://zwei-test:MsVfM7aVBf@${ORIGIN_URL}`;
const PARAM_URL = `${BASE_URL}?${APP_PARAM}`;

const ZweiWebview = () => {
    const [onAppStateChange] = useAppState();
    const {notificationHandler, notiData, resetNotiData} =
        useNotificationHandler();
    notificationHandler();

    const {setBadge} = useShortcutBadge();

    const [deviceToken, setDeviceToken] = useState("");
    const [deviceType, setDeviceType] = useState("");
    const [webviewUrl, setWebviewUrl] = useState(PARAM_URL);
    const [webKey, setWebKey] = useState(0);

    const webviewRef = useRef();

    useEffect(() => {
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    const _notiUrl = remoteMessage?.data.url;
                    const _url = _notiUrl.includes("?")
                        ? `${_notiUrl}&${APP_PARAM}`
                        : `${_notiUrl}?${APP_PARAM}`;
                    const sliceUrl = _url.slice(8);
                    // TODO: Localhost
                    const openUrl = "https://zwei-test:MsVfM7aVBf@" + sliceUrl;
                    // const openUrl = "http://" + sliceUrl;
                    setWebviewUrl(openUrl);
                }
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
            // TODO: Localhost
            setWebviewUrl(_url.replace("http://", "https://"));
            setWebKey(webKey + 1); //reset webview
            resetNotiData();
        }
    }, [notiData]);

    const onNavigationStateChange = (webViewState) => {
        const {url} = webViewState;
        if (!url.includes("flag_app=true")) {
            if (
                url === ORIGIN_URL ||
                url === ORIGIN_URL_SIGN_IN ||
                url === ORIGIN_URL_NEWS ||
                url.includes('cards') ||
                url === ORIGIN_URL_PASSWORD_NEWS
            ) {
                setWebviewUrl(url.includes("?")
                    ? `${url}&${APP_PARAM}`
                    : `${url}?${APP_PARAM}`);
            }
        }
        console.log("onNavigationStateChange-->", url);
    };

    const onResetNotificationCount = useCallback(
        (token = deviceToken) => {
            setBadge(0);
            fetch(
                `${BASE_URL}/api/v1/members/reset_notify?device_token=${
                    token || deviceToken
                }`
            );
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
                <ActivityIndicator color="#009b88" size="large"/>
            </View>
        );
    };

    const renderWebview = () => {
        const js = `
            addPaymentBackButton();
            setToken();
            
            function onBackPayment() {
                window.ReactNativeWebView.postMessage('on_back_payment');
            }
            function setToken() {
                window.document.getElementById('member_device_token').value = '${deviceToken}';
                window.document.getElementById('member_device_name').value = '${deviceType}';
                document.querySelector('.grecaptcha-badge').style.display = 'none';
            }
            function addPaymentBackButton() {
                if (document.location.href.includes('WRP03010Action_doInit.action')) {
                    let btn = document.createElement("div");
                    btn.innerHTML = '<button>もどる</button>';
                    btn.onclick = function(){
                        onBackPayment();
                    };
                    let body = document.getElementsByTagName('body')[0];
                    body.insertBefore(btn, body.children[0]);
                }
            }
        `;

        return (
            <WebView
                key={webKey}
                ref={webviewRef}
                source={{
                    uri: webviewUrl,
                }}
                style={styles.webview}
                showsVerticalScrollIndicator={false}
                javaScriptEnabled={true}
                onNavigationStateChange={onNavigationStateChange}
                javaScriptCanOpenWindowsAutomatically={true}
                onMessage={(event) => {
                    console.log("event-->", event);
                    let data = event.nativeEvent.data;
                    if (data != null && data !== 'undefined') {
                        if(data === 'on_back_payment') {
                            webviewRef.current.goBack();
                        }
                    }
                }}
                injectedJavaScript={js}
                startInLoadingState={true}
                onShouldStartLoadWithRequest={(event) => {
                    const {url} = event;
                    if (
                        url &&
                        !url.includes("flag_app=true")
                    ) {
                        if (
                            url === ORIGIN_URL ||
                            url === ORIGIN_URL_SIGN_IN ||
                            url === ORIGIN_URL_NEWS ||
                            url.includes('cards') ||
                            url === ORIGIN_URL_PASSWORD_NEWS
                        ) {
                            setWebviewUrl(url.includes("?")
                                ? `${url}&${APP_PARAM}`
                                : `${url}?${APP_PARAM}`);
                        }
                    }
                    console.log('Loading: ' + url)
                    if (url.includes('cards')) {
                        let _url = url;
                        if (!url.includes("flag_app=true")) {
                            _url = url.includes("?")
                                ? `${url}&${APP_PARAM}`
                                : `${url}?${APP_PARAM}`;
                        }
                        console.log('Opening link: ' + _url);
                        Linking.openURL(_url);
                        return false;
                    } else if (
                        !url ||
                        url.includes(ORIGIN_URL) ||
                        url.includes("sign_in") ||
                        url.includes('WRP03010Action_doInit.action')
                    ) {
                        url.includes("sign_in") && webviewRef.current.injectJavaScript(js);
                        console.log('Handling url: ' + url)
                        return true;
                    } else {
                        console.log('Opening link: ' + url);
                        Linking.openURL(url);
                        return false;
                    }
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
