import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});

function Home() {
  return (
    <>
      <h1 className="sr-only">Provider Hub v17</h1>
      <iframe
        src="/provider-hub.html"
        title="Provider Hub v17 directory"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          background: "#0f1720",
        }}
      />
    </>
  );
}
