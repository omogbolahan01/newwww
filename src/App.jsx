import { useState, useRef, useEffect } from "react";
import { Player } from "@remotion/player";
import { MyVideoComposition } from "./components/MyVideoComposition";

const fps = 30;

const App = () => {
  const [videos, setVideos] = useState([]);
  const mainVideoRefs = useRef([]);
  const timelineRefs = useRef([]);

  const timeToSeconds = (time) =>
    time.hours * 3600 + time.minutes * 60 + time.seconds;

  const handleUpload = (e) => {
    const files = e.target.files;
    const newVideos = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      duration: 0,
      startTime: { hours: 0, minutes: 1, seconds: 30 },
      endTime: { hours: 0, minutes: 2, seconds: 50 },
      showTrimmed: false,
      currentTime: 0,
    }));

    setVideos((prev) => [...prev, ...newVideos]);
  };

  const handlePreviewToggle = (index) => {
    setVideos((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, showTrimmed: !v.showTrimmed } : v
      )
    );
  };

  const updateTime = (index, field, subField, value) => {
    setVideos((prev) =>
      prev.map((v, i) =>
        i === index
          ? {
              ...v,
              [field]: { ...v[field], [subField]: Number(value) },
            }
          : v
      )
    );
  };

  const updateDuration = (index, duration) => {
    setVideos((prev) =>
      prev.map((v, i) => (i === index ? { ...v, duration } : v))
    );
  };

  const handleTimeUpdate = (index, time) => {
    setVideos((prev) =>
      prev.map((v, i) => (i === index ? { ...v, currentTime: time } : v))
    );
  };

  const handleTimelineClick = (e, index) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickedPercent = clickX / width;

    const mainVideo = mainVideoRefs.current[index];
    const timelineVideo = timelineRefs.current[index];
    const duration = mainVideo?.duration || 0;
    const newTime = duration * clickedPercent;

    if (mainVideo) {
      mainVideo.currentTime = newTime;
    }
    if (timelineVideo) {
      timelineVideo.currentTime = newTime;
    }

    handleTimeUpdate(index, newTime);
  };

  const handleTimelineTouchMove = (e, index) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const width = rect.width;
    const touchedPercent = touchX / width;

    const mainVideo = mainVideoRefs.current[index];
    const timelineVideo = timelineRefs.current[index];
    const duration = mainVideo?.duration || 0;
    const newTime = duration * touchedPercent;

    if (mainVideo) {
      mainVideo.currentTime = newTime;
    }
    if (timelineVideo) {
      timelineVideo.currentTime = newTime;
    }

    handleTimeUpdate(index, newTime);
  };

  const syncTimelineWithMain = (index) => {
    const main = mainVideoRefs.current[index];
    const timeline = timelineRefs.current[index];
    if (!main || !timeline) return;

    timeline.currentTime = main.currentTime;

    const play = () => timeline.play();
    const pause = () => timeline.pause();

    main.addEventListener("play", play);
    main.addEventListener("pause", pause);

    return () => {
      main.removeEventListener("play", play);
      main.removeEventListener("pause", pause);
    };
  };

  useEffect(() => {
    videos.forEach((_, index) => {
      const cleanup = syncTimelineWithMain(index);
      return cleanup;
    });
  }, [videos]);

  return (
    <div style={{ padding: 20 }}>
      <input type="file" accept="video/*" multiple onChange={handleUpload} />

      {videos.map((video, index) => {
        const startSec = timeToSeconds(video.startTime);
        const endSec = timeToSeconds(video.endTime);
        const isTrimmed = video.showTrimmed;

        return (
          <div key={index} style={{ marginTop: 30 }}>
            <h3>Video {index + 1}</h3>

            <video
              src={video.url}
              preload="metadata"
              style={{ display: "none" }}
              onLoadedMetadata={(e) => updateDuration(index, e.target.duration)}
            />

            {/* Time Inputs */}
            <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
              <div>
                <label>Start Time: </label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={video.startTime.hours}
                  onChange={(e) =>
                    updateTime(index, "startTime", "hours", e.target.value)
                  }
                />
                :
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={video.startTime.minutes}
                  onChange={(e) =>
                    updateTime(index, "startTime", "minutes", e.target.value)
                  }
                />
                :
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={video.startTime.seconds}
                  onChange={(e) =>
                    updateTime(index, "startTime", "seconds", e.target.value)
                  }
                />
              </div>

              <div>
                <label>End Time: </label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={video.endTime.hours}
                  onChange={(e) =>
                    updateTime(index, "endTime", "hours", e.target.value)
                  }
                />
                :
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={video.endTime.minutes}
                  onChange={(e) =>
                    updateTime(index, "endTime", "minutes", e.target.value)
                  }
                />
                :
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={video.endTime.seconds}
                  onChange={(e) =>
                    updateTime(index, "endTime", "seconds", e.target.value)
                  }
                />
              </div>
            </div>

            <button onClick={() => handlePreviewToggle(index)}>
              {isTrimmed ? "Show Original Video" : "Preview Trimmed Video"}
            </button>

            <div style={{ marginTop: 15 }}>
              {isTrimmed ? (
                <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
                  <Player
                    component={MyVideoComposition}
                    inputProps={{
                      videoUrl: video.url,
                      startFrom: Math.floor(startSec * fps),
                      endAt: Math.floor(endSec * fps),
                    }}
                    durationInFrames={Math.floor((endSec - startSec) * fps)}
                    fps={fps}
                    compositionWidth={1280}
                    compositionHeight={720}
                    controls
                    autoPlay
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : (
                <>
                  <video
                    ref={(el) => (mainVideoRefs.current[index] = el)}
                    src={video.url}
                    controls
                    onTimeUpdate={(e) =>
                      handleTimeUpdate(index, e.target.currentTime)
                    }
                    style={{ width: "100%", height: "auto", marginTop: 10 }}
                  />

                  {/* Timeline Bar */}
                  <div
                    onClick={(e) => handleTimelineClick(e, index)}
                    onTouchMove={(e) => handleTimelineTouchMove(e, index)}
                    style={{
                      width: "100%",
                      height: 60,
                      marginTop: 10,
                      background: "#000",
                      borderRadius: 6,
                      cursor: "pointer",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <video
                      ref={(el) => (timelineRefs.current[index] = el)}
                      src={video.url}
                      muted
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: `${(video.currentTime / video.duration) * 100}%`,
                        width: 2,
                        height: "100%",
                        background: "red",
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
