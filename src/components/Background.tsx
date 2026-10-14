export default function Background() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0a0a0a 0%, #0d120a 40%, #0a0f08 100%)",
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          top: "-8%",
          right: "-6%",
          width: 480,
          height: 480,
          background: "radial-gradient(circle, rgba(126,211,33,0.15), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          bottom: "-12%",
          left: "-8%",
          width: 520,
          height: 520,
          background: "radial-gradient(circle, rgba(126,211,33,0.12), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: "30%",
          left: "50%",
          width: 380,
          height: 380,
          background: "radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
    </div>
  );
}
