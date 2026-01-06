export const generateVideoThumbnailFromFirstSeconds = async (
    videoSrc: string,
    maxSeconds: number = 5
): Promise<string | null> => {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;

        let thumbnailGenerated = false;
        const timeout = setTimeout(() => {
            if (!thumbnailGenerated) {
                thumbnailGenerated = true;
                resolve(null);
                cleanup();
            }
        }, 10000);

        const cleanup = () => {
            video.pause();
            video.src = "";
            video.load();
            clearTimeout(timeout);
        };

        const generateThumbnail = () => {
            if (thumbnailGenerated) return;
            thumbnailGenerated = true;
            clearTimeout(timeout);

            try {
                if (!video.videoWidth || !video.videoHeight) {
                    resolve(null);
                    cleanup();
                    return;
                }

                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const context = canvas.getContext("2d");
                if (context) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);
                    resolve(thumbnailDataUrl);
                } else {
                    resolve(null);
                }
            } catch (error) {
                resolve(null);
            } finally {
                cleanup();
            }
        };

        video.addEventListener("loadeddata", () => {
            if (video.readyState >= 2 && video.videoWidth > 0) {
                const seekTime = Math.min(1, video.duration || 1);
                video.currentTime = seekTime;
            }
        });

        video.addEventListener("seeked", () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                generateThumbnail();
            }
        });

        video.addEventListener("loadedmetadata", () => {
            if (video.duration > 0) {
                const seekTime = Math.min(1, video.duration);
                video.currentTime = seekTime;
            }
        });

        video.addEventListener("error", () => {
            if (!thumbnailGenerated) {
                thumbnailGenerated = true;
                resolve(null);
                cleanup();
            }
        });

        video.src = videoSrc;
    });
};
