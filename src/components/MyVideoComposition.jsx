import { AbsoluteFill, Video } from "remotion";

export const MyVideoComposition = ({ videoUrl, startFrom, endAt }) => {
  return (
    <AbsoluteFill>
      <Video
        src={videoUrl}
        startFrom={startFrom} // From this frame
        endAt={endAt} // Until this frame
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // Ensures full screen
        }}
      />
    </AbsoluteFill>
  );
};
