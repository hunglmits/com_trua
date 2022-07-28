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
const MEMBERS_SIGN_IN = `members/sign_in`;
const RECAPTCHA = `recaptcha`;
const TOKEN = `token`;
const NEWS = `news`;
const MEMBERS_PASSWORD_NEWS = `members/password/new`;
const APP_PARAM = "flag_app=true";
const IS_MOBILE = "is_mobile=true";

const BASE_URL = `https://zwei-test:MsVfM7aVBf@${ORIGIN_URL}`;

// TODO: Localhost
// const ORIGIN_URL = "192.168.1.127:3001";
// const BASE_URL = `http://${ORIGIN_URL}`;

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

    const js = `
            try {
                document.querySelector('.grecaptcha-badge').style.display = 'none';
                window.document.getElementById('member_device_token').value = '${deviceToken}';
                window.document.getElementById('member_device_name').value = '${deviceType}';
            }
            catch(err) {}
        `;

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
        console.log("onNavigationStateChange-->", includeUrlParams(url));
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

    function includeUrlParams(url) {
        let _url = url;
        if (url &&
            !_url.includes("flag_app=true")) {
            if (Platform.OS === "android" &&
                (_url === ORIGIN_URL ||
                _url === BASE_URL ||
                _url.includes(MEMBERS_SIGN_IN)) ||
                _url.includes(NEWS) ||
                _url.includes(MEMBERS_PASSWORD_NEWS)
            ) {
                _url = _url.includes("?")
                    ? `${_url}&${APP_PARAM}`
                    : `${_url}?${APP_PARAM}`;
            }
        }
        // Register confirmation
        if (_url.includes("register_confirmations") && !_url.includes(IS_MOBILE)) {
            _url = _url.includes("?")
                ? `${_url}&${IS_MOBILE}`
                : `${_url}?${IS_MOBILE}`;
        }
        return _url;
    }

    const renderWebview = () => {
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
                javaScriptCanOpenWindowsAutomatically={true}
                onMessage={(event) => {
                    console.log("event-->", event);
                }}
                injectedJavaScript={js}
                startInLoadingState={true}
                onShouldStartLoadWithRequest={(event) => {
                    const {url} = event;
                    const _url = includeUrlParams(url);
                    if (_url !== url) {
                        console.log('Including params: ' + _url);
                        setWebviewUrl(_url);
                        return true;
                    }
                    console.log('Loading: ' + url);
                    if (url.includes(TOKEN)) {
                        let _url = url;
                        if (!url.includes(APP_PARAM)) {
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
                        url.includes(MEMBERS_SIGN_IN) ||
                        url.includes(RECAPTCHA)
                    ) {
                        console.log('Handling url: ' + url)
                        webviewRef.current.injectJavaScript(js);
                        return true;
                    } else if (!url.includes('about:blank')) {
                        console.log('Opening link: ' + url);
                        Linking.openURL(url);
                        return false;
                    }
                    console.log('Doing nothing with: ' + url);
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
    'grecaptcha-badge': {
        display: 'none'
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
