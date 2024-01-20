/**
 * Displays a notification depending on the type of activity
 * @param activity The type of activity
 */
const showNotification = (activity: string) => {
    if (Notification.permission === 'granted') {
        let notification;
        switch(activity) {
            case "Orbit": {
                notification = new Notification('My Notification', {
                    body: `You're travelling to orbit!!`,
                });
                break;
            }
            case "Social": {
                notification = new Notification('My Notification', {
                    body: `You're travelling to a social space!!`,
                });
                break;
            }
            default: {
                notification = new Notification('My Notification', {
                    body: `New ${activity} activity`,
                });
                break;
            }
        }

        notification.onclick = () => {
            console.log('Notification clicked!');
        };
    } else if (Notification.permission !== 'denied') {

        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(activity);
            }
        });
    }
};

export {showNotification}