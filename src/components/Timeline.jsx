import React, { useState, useEffect } from "react";

const Timeline = ({ currentTime, videoDuration, onSeek }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(currentTime);

  useEffect(() => {
    if (!isDragging) {
      setDragTime(currentTime);
    }
  }, [currentTime, isDragging]);

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseUp = () => {
    setIsDragging(false);
    onSeek(dragTime); // Update video playback position when user releases the timeline
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newTime = (e.clientX / e.target.offsetWidth) * videoDuration;
      setDragTime(Math.min(Math.max(newTime, 0), videoDuration));
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "10px",
        backgroundColor: "#ccc",
        cursor: "pointer",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${(currentTime / videoDuration) * 100}%`,
          width: "10px",
          height: "100%",
          backgroundColor: "blue",
        }}
      />
    </div>
  );
};

export default Timeline;
