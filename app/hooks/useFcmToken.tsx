import { useEffect, useRef, useState } from "react";
import { getToken, onMessage, Unsubscribe } from "firebase/messaging";
import { fetchToken, messaging } from "../firebase.ts";
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner";

const getNotificationPermissionAndToken = async () => {
    // Check if Notifications is supported in the broweser
    if (!("Notification" in window)) {
        console.info("This browser does not support desktop notification");
        return null;
    }

    // Check if permission is already granted..
    if (Notification.permission === "granted") {
        return await fetchToken();
    }

    // If permission is not denied, then request permission from user

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            return await fetchToken();
        }
    }

    console.log("Notification permission not granted");
    return null;
}

const useFcmToken = () => {
    const navigate = useNavigate(); // To redirect on notification click
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const retryLoadToken = useRef(0);
    const isLoading = useRef(false);

    const loadToken = async () => {
        if (isLoading.current) return; // Prevent multiple fetches if already fetched or is in progress

        isLoading.current = true;
        const token = await getNotificationPermissionAndToken();

        // Handing the case where permission is denied
        if (Notification.permission === "denied") {
            setNotificationPermissionStatus("denied");
            isLoading.current = false;
            return;
        }
        
        // Retring the fetch token up to 3 times if neccessary
        if (!token) {
            if (retryLoadToken.current >= 3) {
                alert("Unable to load token, refresh the browser");
                isLoading.current = false;
                return;
            }

            retryLoadToken.current += 1;
            console.error("An error occuered while retrieving token. Retrying...");
            isLoading.current = false;
            await loadToken();
            return;
        }

        setNotificationPermissionStatus(Notification.permission);
        setToken(token);
        isLoading.current = true;
    };

    useEffect(() => {
        if ("Notification" in window) {
            loadToken();
        }
    }, []);

    useEffect(() => {
        const setupListener = async () => {
            if (!token) return;

            const m = await messaging();
            if (!m) return;

            const unsubscribe = onMessage(m, (payload) => {
                if (Notification.permission !== "granted") return;
                
                console.log("Foreground push notification recieved", payload)
                
                toast.info(`${payload.notification?.title}: ${payload.notification?.body}`);
            });

            return unsubscribe;
        };

        // Clean up the listener once the component unmounts
        let unsubscribe: Unsubscribe | null = null;

        setupListener().then((unsub) => {
            if (unsub) {
                unsubscribe = unsub;
            }
        });

        return () => unsubscribe?.();
    }, [token, navigate]);

    return { token, notificationPermissionStatus };
};

export default useFcmToken;
